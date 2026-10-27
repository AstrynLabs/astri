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

/** Body of a request guild members send (opcode 8). Exactly one of `query` and `user_ids` is set. */
export interface GatewayRequestGuildMembersData {
    guild_id: string;
    query?: string;
    limit: number;
    presences?: boolean;
    user_ids?: string[];
    nonce?: string;
}

/** Body of a voice state update send (opcode 4). `channel_id: null` leaves the voice channel. */
export interface GatewayVoiceStateUpdateData {
    guild_id: string;
    channel_id: string | null;
    self_mute: boolean;
    self_deaf: boolean;
}

/** Changes to the client's presence. Fields left out keep their last value. */
export interface PresenceOptions {
    /** Default: `online`. */
    status?: PresenceStatus;
    activities?: GatewayActivity[];
    afk?: boolean;
    /** Unix ms the client went idle, or `null`. */
    since?: number | null;
}

export interface VoiceStateOptions {
    /** Default: `false`. */
    selfMute?: boolean;
    /** Default: `false`. */
    selfDeaf?: boolean;
}

/**
 * Which members to request. With `userIds`, up to 100 specific members are fetched. Otherwise members whose
 * username starts with `query` are, and an empty `query` with `limit: 0` fetches every member, which needs the
 * guild members intent.
 */
export interface RequestGuildMembersOptions {
    /** Default: `''`. */
    query?: string;
    /** Default: `0`, no limit. Must be 1-100 with a non-empty `query`. */
    limit?: number;
    userIds?: string[];
    /** Also send the members' presences. Needs the guild presences intent. Default: `false`. */
    presences?: boolean;
    /** Ms to wait for each chunk before rejecting. Default: `MEMBER_REQUEST_TIMEOUT`. */
    timeout?: number;
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
