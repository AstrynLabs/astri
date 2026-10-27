import type { Cache, CacheManager } from '../core/cache';
import type { RequestHandler } from '../core/rest';
import type { AnyInteraction, AutoModerationRule, Channel, Emoji, Entitlement, Guild, GuildScheduledEvent, Invite, Member, Message, Presence, Role, StageInstance, Sticker, ThreadChannel, ThreadMember, User, VoiceState } from '../core/structures';
import type { AutoModerationActionExecution, GuildApplicationCommandPermissions, MessageReaction, MessageReactionAddEvent, MessageReactionEvent, ReactionEmoji } from '../interfaces';
import type { TextBasedChannel } from './channel';
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
    /** One cache per text-based channel. Unbounded by default like every kind, so consider a `maxSize`. */
    messages: Message;
    stickers: Sticker;
    /** Keyed by code. Filled by invite events and fetches, since guilds arrive without their invites. */
    invites: Invite;
    voiceStates: VoiceState;
    /** Needs the guild presences intent. Offline members are dropped. */
    presences: Presence;
    scheduledEvents: GuildScheduledEvent;
    /** Filled by rule events and fetches, since guilds arrive without their rules. */
    autoModerationRules: AutoModerationRule;
    stageInstances: StageInstance;
    /** The application's entitlements, filled by entitlement events, interactions and fetches. */
    entitlements: Entitlement;
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
    /** Content, embeds, attachments, components and polls are empty without the message content intent, except in DMs, the client's own messages, and messages that mention it. */
    messageCreate: [message: Message];
    /** `old` is a shallow copy from before the update, or `null` if the message was not cached. */
    messageUpdate: [message: Message, old: Message | null];
    /** `message` is the cached instance, or `null` if it was not cached. */
    messageDelete: [id: string, channelId: string, guildId: string | null, message: Message | null];
    /** `messages` holds the deleted ones that were cached. */
    messageDeleteBulk: [ids: string[], channelId: string, guildId: string | null, messages: Message[]];
    /** `member` is sent for guild reactions. */
    messageReactionAdd: [reaction: MessageReactionAddEvent, message: Message | null, member: Member | null];
    messageReactionRemove: [reaction: MessageReactionEvent, message: Message | null];
    /** `removed` holds the reactions the cached message had, and is empty if it was not cached. */
    messageReactionRemoveAll: [messageId: string, channelId: string, guildId: string | null, message: Message | null, removed: MessageReaction[]];
    /** `removed` is the reaction the cached message had, or `null`. */
    messageReactionRemoveEmoji: [emoji: ReactionEmoji, messageId: string, channelId: string, guildId: string | null, message: Message | null, removed: MessageReaction | null];
    /** A user voted for a poll answer. */
    messagePollVoteAdd: [userId: string, answerId: number, messageId: string, channelId: string, guildId: string | null, message: Message | null];
    /** A user took back their vote for a poll answer. */
    messagePollVoteRemove: [userId: string, answerId: number, messageId: string, channelId: string, guildId: string | null, message: Message | null];
    /** A user started typing. `startedAt` is Unix ms, and `member` is sent in guilds. */
    typingStart: [userId: string, channelId: string, guildId: string | null, startedAt: number, member: Member | null, channel: TextBasedChannel | null];
    /** A command, component, autocomplete or modal submission needs a response within 3 seconds. Narrow with `instanceof`. */
    interactionCreate: [interaction: AnyInteraction];
    /** `stickers` is the guild's full sticker list after the update. `old` is `null` if the guild was not cached. */
    guildStickersUpdate: [guildId: string, stickers: Sticker[], old: Sticker[] | null];
    guildScheduledEventCreate: [event: GuildScheduledEvent];
    /** `old` is a shallow copy from before the update, or `null` if the event was not cached. */
    guildScheduledEventUpdate: [event: GuildScheduledEvent, old: GuildScheduledEvent | null];
    /** `event` is the cached instance if there was one, otherwise built from the payload. */
    guildScheduledEventDelete: [event: GuildScheduledEvent];
    /** A user subscribed to a scheduled event. */
    guildScheduledEventUserAdd: [eventId: string, userId: string, guildId: string, event: GuildScheduledEvent | null];
    /** A user unsubscribed from a scheduled event. */
    guildScheduledEventUserRemove: [eventId: string, userId: string, guildId: string, event: GuildScheduledEvent | null];
    /** Needs the manage channels permission in the invite's channel. */
    inviteCreate: [invite: Invite];
    /** `invite` is the cached instance, or `null` if it was not cached. */
    inviteDelete: [code: string, channelId: string, guildId: string | null, invite: Invite | null];
    /** A webhook in the channel was created, edited or deleted. Fetch the channel's webhooks to see which. */
    webhooksUpdate: [channelId: string, guildId: string, channel: Channel | null];
    /** A user joined, left, moved between or changed their state in a voice channel. `state.channelId` is `null` once they left. */
    voiceStateUpdate: [state: VoiceState, old: VoiceState | null];
    /** Needs the guild presences intent. `old` is a shallow copy from before the update, or `null` if the presence was not cached. */
    presenceUpdate: [presence: Presence, old: Presence | null];
    autoModerationRuleCreate: [rule: AutoModerationRule];
    /** `old` is a shallow copy from before the update, or `null` if the rule was not cached. */
    autoModerationRuleUpdate: [rule: AutoModerationRule, old: AutoModerationRule | null];
    /** `rule` is the cached instance if there was one, otherwise built from the payload. */
    autoModerationRuleDelete: [rule: AutoModerationRule];
    /** Needs the auto moderation execution intent. */
    autoModerationActionExecution: [execution: AutoModerationActionExecution];
    stageInstanceCreate: [stageInstance: StageInstance];
    /** `old` is a shallow copy from before the update, or `null` if the stage instance was not cached. */
    stageInstanceUpdate: [stageInstance: StageInstance, old: StageInstance | null];
    /** `stageInstance` is the cached instance if there was one, otherwise built from the payload. */
    stageInstanceDelete: [stageInstance: StageInstance];
    /** A user or guild bought or was given one of the application's SKUs. */
    entitlementCreate: [entitlement: Entitlement];
    /** A subscription renewed or ended. `old` is a shallow copy from before the update, or `null` if the entitlement was not cached. */
    entitlementUpdate: [entitlement: Entitlement, old: Entitlement | null];
    /** An entitlement was refunded, removed by Discord, or a test entitlement was deleted. */
    entitlementDelete: [entitlement: Entitlement];
    /** A guild changed who can use one of the application's commands, or all of them. */
    applicationCommandPermissionsUpdate: [permissions: GuildApplicationCommandPermissions];
}

/** What structures and dispatch handlers need from the client. */
export interface ClientContext {
    readonly cache: CacheManager<ClientCaches>;
    readonly guilds: Cache<string, Guild>;
    readonly users: Cache<string, User>;
    readonly entitlements: Cache<string, Entitlement>;
    readonly rest: RequestHandler;
    readonly user: User | null;
    readonly applicationId: string | null;
    /** Ids of guilds the client is in that have not arrived yet, or are in an outage. */
    readonly unavailableGuilds: Set<string>;
    emit<Event extends keyof ClientEvents>(event: Event, ...args: ClientEvents[Event]): boolean;
}

/** Updates the client's state for one dispatch event and emits the matching client event. */
export type DispatchHandler<T extends keyof GatewayDispatchData> = (client: ClientContext, data: GatewayDispatchData[T], shard: Shard) => void;

export type DispatchHandlers = { [T in keyof GatewayDispatchData]: DispatchHandler<T> };
