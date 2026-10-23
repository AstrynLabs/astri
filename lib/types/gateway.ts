import type { GatewayOpcodes } from '../constants';

interface GatewayControlPayload<Op extends GatewayOpcodes, D> {
    op: Op;
    d: D;
    s: null;
    t: null;
}

/** An event Discord pushes to the client. `t` names the event, `d` is its body. */
export interface GatewayDispatchPayload<D = unknown> {
    op: typeof GatewayOpcodes.Dispatch;
    d: D;
    s: number;
    t: string;
}

export type GatewayHelloPayload = GatewayControlPayload<typeof GatewayOpcodes.Hello, { heartbeat_interval: number }>;
export type GatewayHeartbeatRequestPayload = GatewayControlPayload<typeof GatewayOpcodes.Heartbeat, null>;
export type GatewayHeartbeatAckPayload = GatewayControlPayload<typeof GatewayOpcodes.HeartbeatAck, undefined>;
export type GatewayReconnectPayload = GatewayControlPayload<typeof GatewayOpcodes.Reconnect, null>;
/** `d` is whether the session can still be resumed. */
export type GatewayInvalidSessionPayload = GatewayControlPayload<typeof GatewayOpcodes.InvalidSession, boolean>;

/** Every payload the gateway can send. Narrow on `op`. */
export type GatewayReceivePayload = GatewayDispatchPayload | GatewayHelloPayload | GatewayHeartbeatRequestPayload | GatewayHeartbeatAckPayload | GatewayReconnectPayload | GatewayInvalidSessionPayload;

/** A payload the client sends to the gateway. */
export interface GatewaySendPayload<D = unknown> {
    op: GatewayOpcodes;
    d: D;
}

/** Body of the `READY` dispatch. Only the fields the shard relies on are typed precisely. */
export interface GatewayReadyData {
    v: number;
    user: { id: string; username: string; [key: string]: unknown };
    guilds: { id: string; unavailable?: boolean }[];
    session_id: string;
    resume_gateway_url: string;
    shard?: [id: number, total: number];
    application: { id: string; flags: number };
}

export type PresenceStatus = 'online' | 'dnd' | 'idle' | 'invisible' | 'offline';

export interface GatewayActivity {
    name: string;
    type: number;
    url?: string | null;
    state?: string | null;
}

export interface GatewayPresenceUpdateData {
    since: number | null;
    activities: GatewayActivity[];
    status: PresenceStatus;
    afk: boolean;
}

export interface ConnectionOptions {
    /**
     * Receive payloads as a zlib stream. Cuts bandwidth substantially at a small CPU cost.
     * Requires the optional `zlib-sync` package. Default: `true` when `zlib-sync` is installed.
     */
    compress?: boolean;
}

export interface ConnectionEvents {
    /** The socket is open; the gateway's `HELLO` follows. */
    open: [];
    /** A decoded payload arrived. */
    payload: [payload: GatewayReceivePayload];
    /** The socket closed without `close()` being called: Discord ended it or the network dropped. */
    close: [code: number, reason: string];
    error: [error: Error];
}

export interface ShardOptions {
    /** Bot token, with or without the `Bot ` prefix. */
    token: string;
    /** Bitfield of {@link GatewayIntents}. */
    intents: number;
    /** Total number of shards the bot runs. Default: `1`. */
    total?: number;
    /** Gateway URL to identify against, as returned by `GET /gateway/bot`. Default: `wss://gateway.discord.gg`. */
    gatewayURL?: string;
    /** See {@link ConnectionOptions.compress}. */
    compress?: boolean;
    /** Member count (50–250) above which a guild's offline members are left out of `GUILD_CREATE`. Default: Discord's (50). */
    largeThreshold?: number;
    /** Presence to start with. */
    presence?: GatewayPresenceUpdateData;
    /** Reconnect (and resume when possible) after the connection drops. Default: `true`. */
    autoReconnect?: boolean;
}

/**
 * - `disconnected`: idle; `connect()` starts it
 * - `reconnecting`: waiting out the backoff before the next attempt
 * - `connecting`: socket opening, waiting for `HELLO`
 * - `identifying` / `resuming`: handshake sent, waiting for `READY` / `RESUMED`
 * - `ready`: receiving events
 */
export type ShardStatus = 'disconnected' | 'reconnecting' | 'connecting' | 'identifying' | 'resuming' | 'ready';

export interface ShardEvents {
    /** A new session started. */
    ready: [data: GatewayReadyData];
    /** A dropped session was resumed; missed events are replayed as dispatches. */
    resumed: [];
    /** Every dispatch, including `READY` and `RESUMED`. */
    dispatch: [payload: GatewayDispatchPayload];
    /** The connection closed. The shard reconnects on its own unless the code is fatal or `autoReconnect` is off. */
    disconnect: [code: number, reason: string];
    error: [error: Error];
    debug: [message: string];
}
