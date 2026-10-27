import { EventEmitter } from 'eventemitter3';
import { IDENTIFY_WINDOW, MEMBER_REQUEST_TIMEOUT } from '../../constants';
import type { ActivityInstance, ApplicationRoleConnectionMetadata, GuildApplicationCommandPermissions, GuildMembersChunk, PendingMemberRequest, StickerPack, Subscription, UserGuild, VoiceRegion } from '../../interfaces';
import type {
    APIApplicationCommand,
    APIChannel,
    APICurrentUser,
    APIEntitlement,
    APIGuildPreview,
    APIGuildTemplate,
    APIInvite,
    APISoundboardSound,
    APIStageInstance,
    APISticker,
    APIUser,
    APIWebhook,
    ApplicationCommandBulkData,
    ApplicationCommandCreateData,
    ApplicationCommandEditData,
    ApplicationCommandFetchOptions,
    ClientCaches,
    ClientContext,
    ClientEvents,
    ClientOptions,
    CurrentUserGuildFetchOptions,
    EntitlementFetchOptions,
    GatewayGuildCreateData,
    GatewayPresenceUpdateData,
    GatewayReadyData,
    GuildApplicationCommandBulkData,
    GuildApplicationCommandCreateData,
    GuildFetchOptions,
    InviteFetchOptions,
    PresenceOptions,
    RequestGuildMembersOptions,
    SubscriptionFetchOptions,
    VoiceStateOptions
} from '../../types';
import { CacheManager } from '../cache';
import type { Cache } from '../cache';
import { RequestHandler } from '../rest';
import type { Channel, Entitlement, ExtendedUser, Invite, Member, StageInstance, Sticker, User } from '../structures';
import { ApplicationCommand, Guild, GuildPreview, GuildTemplate, SoundboardSound, upsertChannel, upsertEntitlement, upsertExtendedUser, upsertInvite, upsertStageInstance, upsertSticker, upsertUser, Webhook } from '../structures';
import { toActivityInstance, toCommandPermissions, toRoleConnectionMetadata, toStickerPack, toSubscription, toUserGuild, toVoiceRegion } from '../structures/util';
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
    user: ExtendedUser | null = null;
    /** The bot's application id, known after the first `READY` or the first command call. */
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
    #fetchingApplicationId: Promise<string> | null = null;
    #presence: GatewayPresenceUpdateData | undefined;
    readonly #memberRequests = new Map<string, PendingMemberRequest>();
    #memberNonce = 0;

    constructor(options: ClientOptions) {
        super();
        const { shards, maxConcurrency } = options;
        if (shards !== undefined && !(Number.isInteger(shards) && shards > 0)) throw new RangeError(`Shard count must be a positive integer, received ${shards}`);
        if (maxConcurrency !== undefined && !(Number.isInteger(maxConcurrency) && maxConcurrency > 0)) throw new RangeError(`maxConcurrency must be a positive integer, received ${maxConcurrency}`);
        this.#options = options;
        this.#shardCount = shards ?? null;
        this.#maxConcurrency = maxConcurrency ?? 1;
        this.#gatewayURL = options.gatewayURL;
        this.#presence = options.presence;
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
        for (const [nonce, request] of this.#memberRequests) {
            clearTimeout(request.timer);
            this.#memberRequests.delete(nonce);
            request.reject(new Error('Client disconnected before the guild members request finished'));
        }
    }

    /** Disconnects and stops the cache sweep timer. The client should not be reused afterwards. */
    destroy(): void {
        this.disconnect();
        this.cache.destroy();
        this.rest.removeAllListeners();
        this.removeAllListeners();
    }

    /**
     * The shard a guild's events arrive on.
     *
     * @throws When that shard has not been created, because `connect()` has not run yet.
     */
    shardFor(guildId: string): Shard {
        const id = this.#shardCount === null ? 0 : Number((BigInt(guildId) >> 22n) % BigInt(this.#shardCount));
        const shard = this.shards.get(id);
        if (shard === undefined) throw new Error(`Shard ${id} for guild ${guildId} has not been created, call connect() first`);
        return shard;
    }

    /**
     * Changes the client's presence on every shard. Fields left out keep their last value, and shards that connect
     * later identify with it.
     */
    setPresence(presence: PresenceOptions): void {
        const current = this.#presence;
        this.#presence = {
            since: presence.since !== undefined ? presence.since : (current?.since ?? null),
            activities: presence.activities ?? current?.activities ?? [],
            status: presence.status ?? current?.status ?? 'online',
            afk: presence.afk ?? current?.afk ?? false
        };
        for (const shard of this.shards.values()) shard.updatePresence(this.#presence);
    }

    /**
     * Joins or moves the client to a voice channel in a guild, or leaves voice with `channelId: null`. Only the
     * gateway state changes; there is no voice connection to send or receive audio.
     *
     * @throws When the guild's shard is not ready.
     */
    updateVoiceState(guildId: string, channelId: string | null, options: VoiceStateOptions = {}): void {
        this.shardFor(guildId).updateVoiceState({ guild_id: guildId, channel_id: channelId, self_mute: options.selfMute ?? false, self_deaf: options.selfDeaf ?? false });
    }

    /**
     * Requests members over the gateway and resolves once every chunk has arrived. They are cached as they come in.
     * Prefer this over REST to load a large guild's whole member list.
     *
     * Rejects when the guild's shard is not ready, when a chunk takes longer than `timeout`, or when the client
     * disconnects first.
     */
    requestGuildMembers(guildId: string, options: RequestGuildMembersOptions = {}): Promise<Member[]> {
        const { userIds, presences, timeout = MEMBER_REQUEST_TIMEOUT } = options;
        const nonce = `${Date.now().toString(36)}${(this.#memberNonce++).toString(36)}`;
        return new Promise<Member[]>((resolve, reject) => {
            const timer = setTimeout(() => this.#expireMemberRequest(nonce, guildId), timeout);
            this.#memberRequests.set(nonce, { members: [], timeout, timer, resolve, reject });
            try {
                this.shardFor(guildId).requestGuildMembers({
                    guild_id: guildId,
                    query: userIds === undefined ? (options.query ?? '') : undefined,
                    limit: options.limit ?? 0,
                    presences,
                    user_ids: userIds,
                    nonce
                });
            } catch (error) {
                clearTimeout(timer);
                this.#memberRequests.delete(nonce);
                reject(error as Error);
            }
        });
    }

    /** Hands a members chunk to the `requestGuildMembers` call waiting on its nonce, if there is one. */
    settleMemberRequest(chunk: GuildMembersChunk): void {
        if (chunk.nonce === null) return;
        const request = this.#memberRequests.get(chunk.nonce);
        if (request === undefined) return;
        request.members.push(...chunk.members);
        clearTimeout(request.timer);
        if (chunk.chunkIndex + 1 >= chunk.chunkCount) {
            this.#memberRequests.delete(chunk.nonce);
            request.resolve(request.members);
            return;
        }
        request.timer = setTimeout(() => this.#expireMemberRequest(chunk.nonce as string, chunk.guildId), request.timeout);
    }

    /** Rejects the `requestGuildMembers` call waiting on `nonce`, if there is one. */
    rejectMemberRequest(nonce: string, error: Error): void {
        const request = this.#memberRequests.get(nonce);
        if (request === undefined) return;
        clearTimeout(request.timer);
        this.#memberRequests.delete(nonce);
        request.reject(error);
    }

    /**
     * Asks for the full soundboard sound list of each guild. Each list arrives as a `soundboardSounds` event and
     * replaces the guild's cached sounds.
     *
     * @throws When a guild's shard is not ready.
     */
    requestSoundboardSounds(guildIds: string[]): void {
        const byShard = new Map<Shard, string[]>();
        for (const guildId of guildIds) {
            const shard = this.shardFor(guildId);
            const ids = byShard.get(shard);
            if (ids === undefined) byShard.set(shard, [guildId]);
            else ids.push(guildId);
        }
        for (const [shard, ids] of byShard) shard.requestSoundboardSounds({ guild_ids: ids });
    }

    /** Fetches a user, cached or not, and caches it. */
    async fetchUser(userId: string): Promise<User> {
        return upsertUser(this, (await this.rest.get('user', userId)) as APIUser);
    }

    /** Fetches the client's own user and updates `client.user`. */
    async fetchCurrentUser(): Promise<ExtendedUser> {
        this.user = upsertExtendedUser(this, (await this.rest.get('currentUser')) as APICurrentUser);
        return this.user;
    }

    /** Lists up to 200 guilds the client is in, in id order, with its permissions in each. Nothing is cached. */
    async fetchGuilds(options?: CurrentUserGuildFetchOptions): Promise<UserGuild[]> {
        return ((await this.rest.get('currentUserGuilds', options)) ?? []).map(toUserGuild);
    }

    /** Fetches an invite by code. It is cached when its guild is. */
    async fetchInvite(code: string, options?: InviteFetchOptions): Promise<Invite> {
        return upsertInvite(this, (await this.rest.get('invite', code, options)) as APIInvite);
    }

    /** Fetches the live stage in a stage channel. Fails when nothing is live. */
    async fetchStageInstance(channelId: string): Promise<StageInstance> {
        return upsertStageInstance(this, (await this.rest.get('stageInstance', channelId)) as APIStageInstance);
    }

    /** Fetches any sticker by id: a standard one, or a guild one, cached if its guild is. */
    async fetchSticker(stickerId: string): Promise<Sticker> {
        return upsertSticker(this, (await this.rest.get('sticker', stickerId)) as APISticker);
    }

    /** Fetches every official sticker pack. */
    async fetchStickerPacks(): Promise<StickerPack[]> {
        const { sticker_packs } = await this.rest.get('stickerPacks');
        return sticker_packs.map((pack) => toStickerPack(this, pack));
    }

    async fetchStickerPack(packId: string): Promise<StickerPack> {
        return toStickerPack(this, await this.rest.get('stickerPack', packId));
    }

    /**
     * Fetches a webhook. Without `token`, needs the manage webhooks permission. With it, no permission is needed, but
     * `user` is not returned.
     */
    async fetchWebhook(webhookId: string, token?: string): Promise<Webhook> {
        const webhook = token === undefined ? await this.rest.get('webhook', webhookId) : await this.rest.get('webhookToken', webhookId, token);
        return new Webhook(this, webhook as APIWebhook);
    }

    /** Discord's built-in soundboard sounds, available in every guild. */
    async fetchDefaultSoundboardSounds(): Promise<SoundboardSound[]> {
        const sounds = await this.rest.get('soundboardDefaultSounds');
        return (sounds as APISoundboardSound[]).map((sound) => new SoundboardSound(this, sound));
    }

    /** Voice regions to pick from when setting a channel's `rtc_region`. */
    async fetchVoiceRegions(): Promise<VoiceRegion[]> {
        return ((await this.rest.get('voiceRegions')) ?? []).map(toVoiceRegion);
    }

    /** Fetches the application's entitlements, newest first unless paged with `after`, and caches them. */
    async fetchEntitlements(options?: EntitlementFetchOptions): Promise<Entitlement[]> {
        const entitlements = await this.rest.get('applicationEntitlements', await this.#resolveApplicationId(), options);
        return (entitlements as APIEntitlement[]).map((entitlement) => upsertEntitlement(this, entitlement));
    }

    /** Fetches one of the application's entitlements and caches it. */
    async fetchEntitlement(entitlementId: string): Promise<Entitlement> {
        return upsertEntitlement(this, (await this.rest.get('applicationEntitlement', await this.#resolveApplicationId(), entitlementId)) as APIEntitlement);
    }

    /** Fetches subscriptions to one of the application's subscription SKUs. */
    async fetchSubscriptions(skuId: string, options?: SubscriptionFetchOptions): Promise<Subscription[]> {
        return (await this.rest.get('skuSubscriptions', skuId, options)).map(toSubscription);
    }

    async fetchSubscription(skuId: string, subscriptionId: string): Promise<Subscription> {
        return toSubscription(await this.rest.get('skuSubscription', skuId, subscriptionId));
    }

    /** The application's linked role metadata fields. */
    async fetchRoleConnectionMetadata(): Promise<ApplicationRoleConnectionMetadata[]> {
        return ((await this.rest.get('applicationRoleConnectionsMetadata', await this.#resolveApplicationId())) ?? []).map(toRoleConnectionMetadata);
    }

    /** Fetches a running instance of the application's activity. */
    async fetchActivityInstance(instanceId: string): Promise<ActivityInstance> {
        return toActivityInstance(await this.rest.get('applicationActivityInstance', await this.#resolveApplicationId(), instanceId));
    }

    /** Fetches a channel or thread the client can see. Guild channels and threads are cached with their guild. */
    async fetchChannel(channelId: string): Promise<Channel> {
        return upsertChannel(this, (await this.rest.get('channel', channelId)) as APIChannel);
    }

    /**
     * Fetches a guild the client is in. A cached guild is patched and returned; otherwise the guild is returned
     * without being cached, since the REST payload has no channels, members or voice states.
     */
    async fetchGuild(guildId: string, options?: GuildFetchOptions): Promise<Guild> {
        const data = (await this.rest.get('guild', guildId, options)) as Partial<GatewayGuildCreateData> & { id: string };
        const cached = this.guilds.get(guildId);
        if (cached === undefined) return new Guild(this, data);
        cached.patch(data);
        return cached;
    }

    /** Fetches the public preview of a guild the client is in, or of any discoverable guild. */
    async fetchGuildPreview(guildId: string): Promise<GuildPreview> {
        return new GuildPreview(this, (await this.rest.get('guildPreview', guildId)) as APIGuildPreview);
    }

    /** Fetches a guild template by code. */
    async fetchTemplate(code: string): Promise<GuildTemplate> {
        return new GuildTemplate(this, (await this.rest.get('template', code)) as APIGuildTemplate);
    }

    /** Fetches the global commands, or a guild's commands when `guildId` is given. */
    async fetchCommands(guildId?: string, options?: ApplicationCommandFetchOptions): Promise<ApplicationCommand[]> {
        const applicationId = await this.#resolveApplicationId();
        const commands = guildId === undefined ? await this.rest.get('applicationCommands', applicationId, options) : await this.rest.get('applicationGuildCommands', applicationId, guildId, options);
        return (commands as APIApplicationCommand[]).map((command) => new ApplicationCommand(this, command));
    }

    /** Fetches one global command, or a guild command when `guildId` is given. */
    async fetchCommand(commandId: string, guildId?: string): Promise<ApplicationCommand> {
        const applicationId = await this.#resolveApplicationId();
        const command = guildId === undefined ? await this.rest.get('applicationCommand', applicationId, commandId) : await this.rest.get('applicationGuildCommand', applicationId, guildId, commandId);
        return new ApplicationCommand(this, command as APIApplicationCommand);
    }

    /** Creates a global command, or a guild command when `guildId` is given. A command with the same name and type is overwritten. */
    async createCommand(data: ApplicationCommandCreateData | GuildApplicationCommandCreateData, guildId?: string): Promise<ApplicationCommand> {
        const applicationId = await this.#resolveApplicationId();
        const command = guildId === undefined ? await this.rest.post('applicationCommand', applicationId, data as ApplicationCommandCreateData) : await this.rest.post('applicationGuildCommand', applicationId, guildId, data as GuildApplicationCommandCreateData);
        return new ApplicationCommand(this, command as APIApplicationCommand);
    }

    /** Edits a global command, or a guild command when `guildId` is given. */
    async editCommand(commandId: string, data: ApplicationCommandEditData, guildId?: string): Promise<ApplicationCommand> {
        const applicationId = await this.#resolveApplicationId();
        const command = guildId === undefined ? await this.rest.patch('applicationCommand', applicationId, commandId, data) : await this.rest.patch('applicationGuildCommand', applicationId, guildId, commandId, data);
        return new ApplicationCommand(this, command as APIApplicationCommand);
    }

    /** Deletes a global command, or a guild command when `guildId` is given. */
    async deleteCommand(commandId: string, guildId?: string): Promise<void> {
        const applicationId = await this.#resolveApplicationId();
        if (guildId === undefined) await this.rest.delete('applicationCommand', applicationId, commandId);
        else await this.rest.delete('applicationGuildCommand', applicationId, guildId, commandId);
    }

    /**
     * Replaces every global command, or every command in a guild when `guildId` is given, with `commands`. Commands
     * left out are deleted, and ones whose name and type match an existing command keep its id. An empty list
     * deletes them all.
     */
    async setCommands(commands: ApplicationCommandBulkData | GuildApplicationCommandBulkData, guildId?: string): Promise<ApplicationCommand[]> {
        const applicationId = await this.#resolveApplicationId();
        const result = guildId === undefined ? await this.rest.put('applicationCommands', applicationId, commands as ApplicationCommandBulkData) : await this.rest.put('applicationGuildCommands', applicationId, guildId, commands as GuildApplicationCommandBulkData);
        return ((result ?? []) as APIApplicationCommand[]).map((command) => new ApplicationCommand(this, command));
    }

    /** Fetches the permission overrides of every command that has some in a guild. */
    async fetchCommandPermissions(guildId: string): Promise<GuildApplicationCommandPermissions[]> {
        const applicationId = await this.#resolveApplicationId();
        const permissions = await this.rest.get('applicationGuildCommandsPermissions', applicationId, guildId);
        return permissions.map(toCommandPermissions);
    }

    /** The application id from `READY`, or from `GET /applications/@me` when no shard has been ready yet. */
    #resolveApplicationId(): Promise<string> {
        if (this.applicationId !== null) return Promise.resolve(this.applicationId);
        this.#fetchingApplicationId ??= this.rest.get('currentApplication').then(
            (application) => {
                this.applicationId ??= application.id;
                return this.applicationId;
            },
            (error: unknown) => {
                this.#fetchingApplicationId = null;
                throw error;
            }
        );
        return this.#fetchingApplicationId;
    }

    #expireMemberRequest(nonce: string, guildId: string): void {
        const request = this.#memberRequests.get(nonce);
        if (request === undefined) return;
        this.#memberRequests.delete(nonce);
        request.reject(new Error(`Timed out waiting for members of guild ${guildId} after ${request.members.length} were received`));
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
        const { token, intents, compress, largeThreshold, autoReconnect } = this.#options;
        const shard = new Shard(id, { token, intents, total: this.#shardCount as number, gatewayURL: this.#gatewayURL, compress, largeThreshold, presence: this.#presence, autoReconnect });
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
        this.user = upsertExtendedUser(this, data.user as unknown as APICurrentUser);
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
