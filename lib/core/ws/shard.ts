import { EventEmitter } from 'eventemitter3';
import { DEFAULT_GATEWAY_URL, GatewayCloseCodes, GatewayOpcodes } from '../../constants';
import type { GatewayReadyData, GatewayReceivePayload, GatewaySendPayload, ShardEvents, ShardOptions, ShardStatus } from '../../types';
import { Connection } from './connection';

const FATAL_CLOSE_CODES = new Set<number>([GatewayCloseCodes.AuthenticationFailed, GatewayCloseCodes.InvalidShard, GatewayCloseCodes.ShardingRequired, GatewayCloseCodes.InvalidAPIVersion, GatewayCloseCodes.InvalidIntents, GatewayCloseCodes.DisallowedIntents]);
const SESSION_RESET_CODES = new Set<number>([GatewayCloseCodes.InvalidSeq, GatewayCloseCodes.SessionTimedOut]);
const RESUMABLE_CLOSE_CODE = 4000;
const MAX_RECONNECT_DELAY = 30_000;

/**
 * One gateway session: heartbeating, identifying, resuming, and reconnecting when the connection drops.
 *
 * The shard does not coordinate with its siblings. Spacing identifies across shards to respect the bot's
 * `max_concurrency` is the job of whatever calls `connect()`.
 */
export class Shard extends EventEmitter<ShardEvents> {
    readonly id: number;
    readonly total: number;

    readonly #options: Required<Pick<ShardOptions, 'token' | 'intents' | 'gatewayURL' | 'autoReconnect'>> & ShardOptions;
    readonly #connection: Connection;
    #status: ShardStatus = 'disconnected';
    #sessionId: string | null = null;
    #sequence: number | null = null;
    #resumeURL: string | null = null;
    #latency = Infinity;
    #acked = true;
    #lastHeartbeat = 0;
    #reconnectAttempts = 0;
    #heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
    #identifyTimer: ReturnType<typeof setTimeout> | null = null;
    #reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(id: number, options: ShardOptions) {
        super();
        const total = options.total ?? 1;
        if (!(Number.isInteger(total) && total > 0)) throw new RangeError(`Shard total must be a positive integer, received ${total}`);
        if (!(Number.isInteger(id) && id >= 0 && id < total)) throw new RangeError(`Shard id must be an integer in [0, ${total}), received ${id}`);
        this.id = id;
        this.total = total;
        this.#options = {
            ...options,
            token: options.token.replace(/^Bot\s+/i, ''),
            gatewayURL: options.gatewayURL ?? DEFAULT_GATEWAY_URL,
            autoReconnect: options.autoReconnect ?? true
        };

        this.#connection = new Connection({ compress: options.compress });
        this.#connection.on('payload', (payload) => this.#onPayload(payload));
        this.#connection.on('close', (code, reason) => this.#onClose(code, reason));
        this.#connection.on('error', (error) => this.emit('error', error));
    }

    get status(): ShardStatus {
        return this.#status;
    }

    /** Current session id, or `null` before the first `READY` and after the session is invalidated. */
    get sessionId(): string | null {
        return this.#sessionId;
    }

    /** Sequence number of the last dispatch received. */
    get sequence(): number | null {
        return this.#sequence;
    }

    /** Round trip of the last acknowledged heartbeat in ms. `Infinity` until the first ack. */
    get latency(): number {
        return this.#latency;
    }

    /** Opens the connection. Resumes if a session is held, identifies otherwise. Does nothing unless `disconnected`. */
    connect(): void {
        if (this.#status !== 'disconnected') return;
        this.#reconnectAttempts = 0;
        this.#open();
    }

    /** Closes the connection for good and forgets the session, so the next `connect()` identifies fresh. */
    disconnect(): void {
        if (this.#status === 'disconnected') return;
        this.#teardown();
        if (this.#reconnectTimer !== null) clearTimeout(this.#reconnectTimer);
        this.#reconnectTimer = null;
        this.#connection.close(1000, 'Disconnect');
        this.#resetSession();
        this.#status = 'disconnected';
        this.emit('disconnect', 1000, 'Disconnect');
    }

    /** Sends a raw payload, such as a presence update or a guild members request. */
    send(payload: GatewaySendPayload): void {
        this.#connection.send(payload);
    }

    #open(): void {
        this.#status = 'connecting';
        const url = this.#resumeURL ?? this.#options.gatewayURL;
        this.emit('debug', `[Shard ${this.id}] Connecting to ${url}`);
        this.#connection.connect(url);
    }

    #onPayload(payload: GatewayReceivePayload): void {
        switch (payload.op) {
            case GatewayOpcodes.Dispatch:
                this.#sequence = payload.s;
                if (payload.t === 'READY') {
                    const data = payload.d as GatewayReadyData;
                    this.#sessionId = data.session_id;
                    this.#resumeURL = data.resume_gateway_url;
                    this.#status = 'ready';
                    this.#reconnectAttempts = 0;
                    this.emit('debug', `[Shard ${this.id}] Ready, session ${data.session_id}`);
                    this.emit('ready', data);
                } else if (payload.t === 'RESUMED') {
                    this.#status = 'ready';
                    this.#reconnectAttempts = 0;
                    this.emit('debug', `[Shard ${this.id}] Resumed session ${this.#sessionId}`);
                    this.emit('resumed');
                }
                this.emit('dispatch', payload);
                break;
            case GatewayOpcodes.Hello:
                this.#startHeartbeat(payload.d.heartbeat_interval);
                if (this.#sessionId !== null && this.#sequence !== null) this.#resume();
                else this.#identify();
                break;
            case GatewayOpcodes.Heartbeat:
                this.#heartbeat(true);
                break;
            case GatewayOpcodes.HeartbeatAck:
                this.#acked = true;
                this.#latency = Date.now() - this.#lastHeartbeat;
                break;
            case GatewayOpcodes.Reconnect:
                this.emit('debug', `[Shard ${this.id}] Gateway requested a reconnect`);
                this.#reconnect('Reconnect requested');
                break;
            case GatewayOpcodes.InvalidSession:
                this.emit('debug', `[Shard ${this.id}] Session invalidated (resumable: ${payload.d})`);
                if (payload.d) {
                    this.#reconnect('Session invalidated');
                    break;
                }
                this.#resetSession();
                this.#identifyTimer = setTimeout(
                    () => {
                        this.#identifyTimer = null;
                        this.#identify();
                    },
                    1000 + Math.random() * 4000
                );
                break;
        }
    }

    #identify(): void {
        this.#status = 'identifying';
        const { token, intents, largeThreshold, presence } = this.#options;
        this.#connection.send({
            op: GatewayOpcodes.Identify,
            d: {
                token,
                intents,
                properties: { os: process.platform, browser: 'astri-ts', device: 'astri-ts' },
                large_threshold: largeThreshold,
                shard: [this.id, this.total],
                presence
            }
        });
    }

    #resume(): void {
        this.#status = 'resuming';
        this.#connection.send({
            op: GatewayOpcodes.Resume,
            d: { token: this.#options.token, session_id: this.#sessionId, seq: this.#sequence }
        });
    }

    #startHeartbeat(interval: number): void {
        this.#stopHeartbeat();
        this.#acked = true;
        this.#heartbeatTimer = setTimeout(() => {
            this.#heartbeat();
            this.#heartbeatTimer = setInterval(() => this.#heartbeat(), interval);
        }, interval * Math.random());
    }

    #stopHeartbeat(): void {
        if (this.#heartbeatTimer !== null) clearInterval(this.#heartbeatTimer);
        this.#heartbeatTimer = null;
    }

    #heartbeat(requested = false): void {
        if (!requested && !this.#acked) {
            this.emit('debug', `[Shard ${this.id}] Heartbeat not acknowledged, connection is zombied`);
            this.#reconnect('Heartbeat timeout');
            return;
        }
        this.#acked = false;
        this.#lastHeartbeat = Date.now();
        this.#connection.send({ op: GatewayOpcodes.Heartbeat, d: this.#sequence }, true);
    }

    #reconnect(reason: string): void {
        this.#connection.close(RESUMABLE_CLOSE_CODE, reason);
        this.#onClose(RESUMABLE_CLOSE_CODE, reason);
    }

    #onClose(code: number, reason: string): void {
        this.#teardown();
        this.#status = 'disconnected';
        this.emit('debug', `[Shard ${this.id}] Closed with ${code}${reason ? ` (${reason})` : ''}`);
        this.emit('disconnect', code, reason);

        if (FATAL_CLOSE_CODES.has(code)) {
            this.#resetSession();
            this.emit('error', new Error(`Shard ${this.id} closed with unrecoverable code ${code}${reason ? `: ${reason}` : ''}`));
            return;
        }
        if (SESSION_RESET_CODES.has(code)) this.#resetSession();
        if (!this.#options.autoReconnect) return;

        const delay = this.#reconnectAttempts === 0 ? 0 : Math.min(1000 * 2 ** (this.#reconnectAttempts - 1), MAX_RECONNECT_DELAY);
        this.#reconnectAttempts++;
        this.#status = 'reconnecting';
        this.emit('debug', `[Shard ${this.id}] Reconnecting in ${delay}ms (attempt ${this.#reconnectAttempts})`);
        this.#reconnectTimer = setTimeout(() => {
            this.#reconnectTimer = null;
            this.#open();
        }, delay);
    }

    #teardown(): void {
        this.#stopHeartbeat();
        if (this.#identifyTimer !== null) clearTimeout(this.#identifyTimer);
        this.#identifyTimer = null;
    }

    #resetSession(): void {
        this.#sessionId = null;
        this.#sequence = null;
        this.#resumeURL = null;
    }
}
