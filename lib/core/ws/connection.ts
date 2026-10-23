import { createRequire } from 'node:module';
import { EventEmitter } from 'eventemitter3';
import WebSocket from 'ws';
import { GATEWAY_VERSION } from '../../constants';
import type { ConnectionEvents, ConnectionOptions, GatewayReceivePayload, GatewaySendPayload } from '../../types';

type ZlibSync = typeof import('zlib-sync');

const zlib = loadZlib();
const ZLIB_SUFFIX = 0x0000ffff;
const SEND_LIMIT = 120;
const SEND_WINDOW = 60_000;
const PRIORITY_RESERVE = 5;

/**
 * A single gateway WebSocket: opens it, decompresses and decodes what arrives, and encodes and rate-limits
 * what goes out. It knows nothing about sessions or heartbeats; {@link Shard} drives it.
 *
 * Outgoing payloads are held to Discord's 120-per-minute limit. A few slots per window are kept back for
 * priority sends (heartbeats), so a burst of presence updates can never starve the connection.
 */
export class Connection extends EventEmitter<ConnectionEvents> {
    /** Whether payloads arrive zlib-stream compressed. */
    readonly compress: boolean;

    #ws: WebSocket | null = null;
    #inflate: InstanceType<ZlibSync['Inflate']> | null = null;
    readonly #queue: string[] = [];
    #remaining = SEND_LIMIT;
    #resetAt = 0;
    #drainTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(options: ConnectionOptions = {}) {
        super();
        const compress = options.compress ?? zlib !== null;
        if (compress && zlib === null) throw new Error('Gateway compression requires the optional "zlib-sync" package');
        this.compress = compress;
    }

    /** `true` from the socket opening until it closes. */
    get open(): boolean {
        return this.#ws?.readyState === WebSocket.OPEN;
    }

    /** Payloads waiting for rate-limit room. */
    get queued(): number {
        return this.#queue.length;
    }

    /** Opens a socket to `url`, dropping any current one first. Version, encoding and compression query parameters are added here. */
    connect(url: string): void {
        this.close();
        const target = new URL(url);
        target.searchParams.set('v', String(GATEWAY_VERSION));
        target.searchParams.set('encoding', 'json');
        if (this.compress) target.searchParams.set('compress', 'zlib-stream');
        this.#inflate = this.compress ? new zlib!.Inflate({ chunkSize: 128 * 1024, to: 'string' }) : null;

        const ws = new WebSocket(target);
        this.#ws = ws;
        ws.on('open', () => {
            this.#drain();
            this.emit('open');
        });
        ws.on('message', (data) => this.#onMessage(data));
        ws.on('error', (error) => this.emit('error', error));
        ws.on('close', (code, reason) => {
            this.#reset();
            this.emit('close', code, reason.toString());
        });
    }

    /**
     * Closes the socket and discards anything still queued. Does not emit `close`: the caller already knows.
     * Any code other than 1000 or 1001 leaves the session resumable.
     */
    close(code = 1000, reason = ''): void {
        const ws = this.#ws;
        if (ws === null) return;
        this.#reset();
        ws.removeAllListeners();
        ws.on('error', () => {});
        if (ws.readyState === WebSocket.OPEN) ws.close(code, reason);
        else ws.terminate();
    }

    /**
     * Encodes and sends `payload`. Normal sends wait in a queue when the rate limit is reached, and a queue
     * built up before the socket opens is flushed on open. Priority sends skip the queue and are dropped
     * if the socket is not open.
     */
    send(payload: GatewaySendPayload, priority = false): void {
        const data = JSON.stringify(payload);
        if (priority) {
            if (!this.open) return;
            this.#take(true);
            this.#ws!.send(data);
            return;
        }
        this.#queue.push(data);
        this.#drain();
    }

    #drain(): void {
        if (this.#drainTimer !== null || !this.open) return;
        while (this.#queue.length > 0) {
            if (!this.#take(false)) {
                this.#drainTimer = setTimeout(() => {
                    this.#drainTimer = null;
                    this.#drain();
                }, this.#resetAt - Date.now());
                return;
            }
            this.#ws!.send(this.#queue.shift()!);
        }
    }

    #take(priority: boolean): boolean {
        const now = Date.now();
        if (now >= this.#resetAt) {
            this.#remaining = SEND_LIMIT;
            this.#resetAt = now + SEND_WINDOW;
        }
        if (this.#remaining <= (priority ? 0 : PRIORITY_RESERVE)) return false;
        this.#remaining--;
        return true;
    }

    #onMessage(data: WebSocket.RawData): void {
        let text: string;
        if (this.#inflate !== null) {
            const chunk = toBuffer(data);
            const flush = chunk.length >= 4 && chunk.readUInt32BE(chunk.length - 4) === ZLIB_SUFFIX;
            this.#inflate.push(chunk, flush && zlib!.Z_SYNC_FLUSH);
            if (!flush) return;
            if (this.#inflate.err < 0) {
                this.emit('error', new Error(`Gateway inflate failed: ${this.#inflate.msg}`));
                this.#ws?.terminate();
                return;
            }
            text = this.#inflate.result as string;
        } else {
            text = toBuffer(data).toString();
        }

        let payload: GatewayReceivePayload;
        try {
            payload = JSON.parse(text);
        } catch (error) {
            this.emit('error', error as Error);
            return;
        }
        this.emit('payload', payload);
    }

    #reset(): void {
        this.#ws = null;
        this.#inflate = null;
        this.#queue.length = 0;
        this.#remaining = SEND_LIMIT;
        this.#resetAt = 0;
        if (this.#drainTimer !== null) clearTimeout(this.#drainTimer);
        this.#drainTimer = null;
    }
}

function toBuffer(data: WebSocket.RawData): Buffer {
    if (Buffer.isBuffer(data)) return data;
    if (Array.isArray(data)) return Buffer.concat(data);
    return Buffer.from(data);
}

function loadZlib(): ZlibSync | null {
    try {
        return createRequire(import.meta.url)('zlib-sync') as ZlibSync;
    } catch {
        return null;
    }
}
