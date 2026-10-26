import type { Cache, CacheManager } from '../core/cache';
import type { RequestHandler } from '../core/rest';
import type { Channel, Emoji, Guild, Member, Role, ThreadChannel, ThreadMember, User } from '../core/structures';
import type { Shard } from '../core/ws';
import type { CacheManagerOptions } from './cache';
import type { GatewayDispatchData } from './discord';
import type { GatewayDispatchPayload, GatewayReadyData, ShardOptions } from './gateway';
import type { RESTOptions, RESTRateLimitInfo } from './rest';

export interface ClientOptions extends Omit<ShardOptions, 'total'> {
    /** Number of shards to run. Default: `1`. */
    shards?: number;
    /** Shards allowed to identify per 5 second window, from `GET /gateway/bot`'s `max_concurrency`. Default: `1`. */
    maxConcurrency?: number;
    /** How each kind of structure is cached. */
    cache?: CacheManagerOptions<ClientCaches>;
    /** REST request handling. The token is taken from `token`. */
    rest?: Omit<RESTOptions, 'token'>;
}

/** Every cache kind the client builds, mapped to the structure it holds. */
export interface ClientCaches {
    guilds: Guild;
    users: User;
    roles: Role;
    members: Member;
    emojis: Emoji;
    channels: Channel;
    threads: ThreadChannel;
    threadMembers: ThreadMember;
}

export interface ClientEvents {
    /** Every shard has finished its first `READY`. Guilds may still be arriving. */
    ready: [];
    /** A shard started a new session. */
    shardReady: [shard: Shard, data: GatewayReadyData];
    /** A shard resumed a dropped session. */
    shardResume: [shard: Shard];
    /** A shard's connection closed. It reconnects on its own unless the code is fatal or `autoReconnect` is off. */
    shardDisconnect: [shard: Shard, code: number, reason: string];
    /** Every dispatch from every shard, before the library handles it. */
    rawDispatch: [payload: GatewayDispatchPayload, shard: Shard];
    error: [error: Error, shard: Shard];
    /** A REST request hit a 429 and is queued to retry. */
    rateLimit: [info: RESTRateLimitInfo];
    debug: [message: string];
    /** The client joined a guild. */
    guildCreate: [guild: Guild];
    /** A guild the client was already in became visible: at startup, or when an outage ends. */
    guildAvailable: [guild: Guild];
    /** `old` is a shallow copy from before the update, or `null` if the guild was not cached. */
    guildUpdate: [guild: Guild, old: Guild | null];
    /** The client left or was removed from a guild. */
    guildDelete: [id: string, guild: Guild | null];
    /** A guild dropped out because of an outage. It stays out of the cache until `guildAvailable`. */
    guildUnavailable: [id: string, guild: Guild | null];
    guildRoleCreate: [role: Role];
    guildRoleUpdate: [role: Role, old: Role | null];
    guildRoleDelete: [id: string, guildId: string, role: Role | null];
    guildMemberAdd: [member: Member];
    guildMemberUpdate: [member: Member, old: Member | null];
    guildMemberRemove: [user: User, guildId: string, member: Member | null];
    guildBanAdd: [user: User, guildId: string];
    guildBanRemove: [user: User, guildId: string];
    /** `emojis` is the guild's full emoji list after the update. `old` is `null` if the guild was not cached. */
    guildEmojisUpdate: [guildId: string, emojis: Emoji[], old: Emoji[] | null];
    channelCreate: [channel: Channel];
    /**
     * `old` is a shallow copy from before the update, or `null` if the channel was not cached. If the type changed,
     * `channel` is a new instance of the matching class and `old` is the replaced one.
     */
    channelUpdate: [channel: Channel, old: Channel | null];
    /** `channel` is the cached instance if there was one, otherwise built from the payload. */
    channelDelete: [channel: Channel];
    /** A message was pinned or unpinned. `lastPinTimestamp` is Unix ms, or `null` with no pins left. */
    channelPinsUpdate: [channelId: string, guildId: string | null, lastPinTimestamp: number | null, channel: Channel | null];
    /** A thread was created, or the client was added to an existing one (`newlyCreated` is then `false`). */
    threadCreate: [thread: ThreadChannel, newlyCreated: boolean];
    /** `old` is a shallow copy from before the update, or `null` if the thread was not cached. */
    threadUpdate: [thread: ThreadChannel, old: ThreadChannel | null];
    threadDelete: [id: string, guildId: string, parentId: string, thread: ThreadChannel | null];
    /**
     * The client gained access to channels and was sent their active threads. `channelIds` lists the synced
     * parents, or is `null` when the whole guild was synced. Cached threads under them that are not in `threads`
     * were dropped.
     */
    threadListSync: [guildId: string, threads: ThreadChannel[], channelIds: string[] | null];
    /** The client's own membership in a thread changed. */
    threadMemberUpdate: [member: ThreadMember, thread: ThreadChannel | null];
    /** Users were added to or removed from a thread. Other users than the client need the guild members intent. */
    threadMembersUpdate: [threadId: string, guildId: string, added: ThreadMember[], removedIds: string[], thread: ThreadChannel | null];
}

/** What structures and dispatch handlers need from the client. */
export interface ClientContext {
    readonly cache: CacheManager<ClientCaches>;
    readonly guilds: Cache<string, Guild>;
    readonly users: Cache<string, User>;
    readonly rest: RequestHandler;
    readonly user: User | null;
    /** Ids of guilds the client is in that have not arrived yet, or are in an outage. */
    readonly unavailableGuilds: Set<string>;
    emit<Event extends keyof ClientEvents>(event: Event, ...args: ClientEvents[Event]): boolean;
}

/** Updates the client's state for one dispatch event and emits the matching client event. */
export type DispatchHandler<T extends keyof GatewayDispatchData> = (client: ClientContext, data: GatewayDispatchData[T], shard: Shard) => void;

export type DispatchHandlers = { [T in keyof GatewayDispatchData]: DispatchHandler<T> };
