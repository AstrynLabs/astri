import { EventEmitter } from 'eventemitter3';
import { IDENTIFY_WINDOW } from '../../constants';
import type { APIUser, ClientCaches, ClientContext, ClientEvents, ClientOptions, GatewayReadyData } from '../../types';
import { CacheManager } from '../cache';
import type { Cache } from '../cache';
import { RequestHandler } from '../rest';
import type { Entitlement, Guild, User } from '../structures';
import { upsertUser } from '../structures';
import { handleDispatch, Shard } from '../ws';

/**
 * Entry point of the library: runs the shards, keeps the caches current from their dispatches, and re-emits
 * what happened as {@link ClientEvents}.
 */
export class Client extends EventEmitter<ClientEvents> implements ClientContext {
    readonly cache: CacheManager<ClientCaches>;
    readonly guilds: Cache<string, Guild>;
    readonly users: Cache<string, User>;
    readonly entitlements: Cache<string, Entitlement>;
    readonly rest: RequestHandler;
    readonly unavailableGuilds = new Set<string>();
    readonly shards = new Map<number, Shard>();
    user: User | null = null;
    /** The bot's application id, known after the first `READY`. Needed to register commands. */
    applicationId: string | null = null;

    readonly #options: ClientOptions;
    readonly #readyShards = new Set<number>();
    readonly #connectTimers = new Set<ReturnType<typeof setTimeout>>();
    #shardCount: number | null;
    #maxConcurrency: number;
    #gatewayURL: string | undefined;
    #sharding: Promise<void> | null = null;
    #generation = 0;
    #ready = false;

    constructor(options: ClientOptions) {
        super();
        const { shards, maxConcurrency } = options;
        if (shards !== undefined && !(Number.isInteger(shards) && shards > 0)) throw new RangeError(`Shard count must be a positive integer, received ${shards}`);
        if (maxConcurrency !== undefined && !(Number.isInteger(maxConcurrency) && maxConcurrency > 0)) throw new RangeError(`maxConcurrency must be a positive integer, received ${maxConcurrency}`);
        this.#options = options;
        this.#shardCount = shards ?? null;
        this.#maxConcurrency = maxConcurrency ?? 1;
        this.#gatewayURL = options.gatewayURL;
        this.cache = new CacheManager(options.cache);
        this.guilds = this.cache.create('guilds');
        this.users = this.cache.create('users');
        this.entitlements = this.cache.create('entitlements');
        this.rest = new RequestHandler({ ...options.rest, token: options.token });
        this.rest.on('rateLimit', (info) => this.emit('rateLimit', info));
        this.rest.on('debug', (message) => this.emit('debug', message));
    }

    /** Whether every shard has finished its first `READY`. */
    get ready(): boolean {
        return this.#ready;
    }

    /** Average heartbeat round trip across shards in ms. `Infinity` until every shard has an ack. */
    get latency(): number {
        if (this.shards.size === 0) return Infinity;
        let total = 0;
        for (const shard of this.shards.values()) total += shard.latency;
        return total / this.shards.size;
    }

    /**
     * Connects every shard. Without a `shards` option, the shard count, `maxConcurrency` and gateway URL are first
     * fetched from `GET /gateway/bot`, once per client. Identifies are staggered in buckets of `maxConcurrency` every
     * 5 seconds to stay within Discord's identify limit. Does nothing for shards that are already connected.
     *
     * @throws When `GET /gateway/bot` fails, or reports fewer session starts left than shards to start.
     */
    async connect(): Promise<void> {
        const generation = this.#generation;
        if (this.#shardCount === null) {
            this.#sharding ??= this.#fetchSharding().catch((error: unknown) => {
                this.#sharding = null;
                throw error;
            });
            await this.#sharding;
            if (generation !== this.#generation) return;
        }
        const shardCount = this.#shardCount as number;
        for (let id = 0; id < shardCount; id++) {
            const shard = this.shards.get(id) ?? this.#createShard(id);
            const delay = Math.floor(id / this.#maxConcurrency) * IDENTIFY_WINDOW;
            if (delay === 0) {
                shard.connect();
                continue;
            }
            const timer = setTimeout(() => {
                this.#connectTimers.delete(timer);
                shard.connect();
            }, delay);
            this.#connectTimers.add(timer);
        }
    }

    /** Disconnects every shard and cancels any still waiting to connect. Caches are kept. */
    disconnect(): void {
        this.#generation++;
        for (const timer of this.#connectTimers) clearTimeout(timer);
        this.#connectTimers.clear();
        for (const shard of this.shards.values()) shard.disconnect();
        this.#readyShards.clear();
        this.#ready = false;
    }

    /** Disconnects and stops the cache sweep timer. The client should not be reused afterwards. */
    destroy(): void {
        this.disconnect();
        this.cache.destroy();
        this.rest.removeAllListeners();
        this.removeAllListeners();
    }

    async #fetchSharding(): Promise<void> {
        const gateway = await this.rest.get('gatewayBot');
        const { max_concurrency, remaining, reset_after } = gateway.session_start_limit;
        if (remaining < gateway.shards) throw new Error(`Only ${remaining} session starts left for ${gateway.shards} shards, the limit resets in ${Math.ceil(reset_after / 1000)}s`);
        this.#shardCount = gateway.shards;
        this.#maxConcurrency = this.#options.maxConcurrency ?? max_concurrency;
        this.#gatewayURL = this.#options.gatewayURL ?? gateway.url;
        this.emit('debug', `[Client] Using ${gateway.shards} recommended shards, max concurrency ${this.#maxConcurrency}, ${remaining}/${gateway.session_start_limit.total} session starts left`);
    }

    #createShard(id: number): Shard {
        const { token, intents, compress, largeThreshold, presence, autoReconnect } = this.#options;
        const shard = new Shard(id, { token, intents, total: this.#shardCount as number, gatewayURL: this.#gatewayURL, compress, largeThreshold, presence, autoReconnect });
        shard.on('ready', (data) => this.#onShardReady(shard, data));
        shard.on('resumed', () => this.emit('shardResume', shard));
        shard.on('disconnect', (code, reason) => this.emit('shardDisconnect', shard, code, reason));
        shard.on('error', (error) => this.emit('error', error, shard));
        shard.on('debug', (message) => this.emit('debug', message));
        shard.on('dispatch', (payload) => {
            this.emit('rawDispatch', payload, shard);
            handleDispatch(this, payload, shard);
        });
        this.shards.set(id, shard);
        return shard;
    }

    #onShardReady(shard: Shard, data: GatewayReadyData): void {
        this.user = upsertUser(this, data.user as unknown as APIUser);
        this.applicationId = data.application.id;
        for (const guild of data.guilds) this.unavailableGuilds.add(guild.id);
        this.emit('shardReady', shard, data);

        this.#readyShards.add(shard.id);
        if (!this.#ready && this.#readyShards.size === this.shards.size) {
            this.#ready = true;
            this.emit('ready');
        }
    }
}
