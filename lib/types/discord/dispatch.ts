import type { ChannelTypes, ReactionTypes } from '../../constants';
import type { APIChannel, APIThreadMember } from './channel';
import type { APIGuildEmoji } from './emoji';
import type { APIGuild } from './guild';
import type { APIInteraction } from './interaction';
import type { APIGuildMember } from './member';
import type { APIMessage, APIReactionEmoji, GatewayMessageMember } from './message';
import type { APIRole } from './role';
import type { APIUser } from './user';

/** `GUILD_CREATE` body: the full guild plus fields only sent when the client first receives it. */
export interface GatewayGuildCreateData extends APIGuild {
    joined_at: string;
    large: boolean;
    unavailable?: boolean;
    member_count: number;
    /** Not every member: large guilds leave out offline ones. */
    members: APIGuildMember[];
    channels: APIChannel[];
    /** Every active thread the client can see. */
    threads: APIChannel[];
}

/** `GUILD_DELETE` body. `unavailable` is set when the guild dropped out in an outage, and absent when the client left or was removed. */
export interface GatewayGuildDeleteData {
    id: string;
    unavailable?: boolean;
}

export interface GatewayGuildRoleData {
    guild_id: string;
    role: APIRole;
}

export interface GatewayGuildRoleDeleteData {
    guild_id: string;
    role_id: string;
}

export interface GatewayGuildMemberAddData extends APIGuildMember {
    guild_id: string;
}

/** `GUILD_MEMBER_UPDATE` body. Voice state and flags may be left out. */
export interface GatewayGuildMemberUpdateData extends Omit<APIGuildMember, 'deaf' | 'mute' | 'flags'> {
    guild_id: string;
    deaf?: boolean;
    mute?: boolean;
    flags?: number;
}

export interface GatewayGuildMemberRemoveData {
    guild_id: string;
    user: APIUser;
}

export interface GatewayGuildBanData {
    guild_id: string;
    user: APIUser;
}

export interface GatewayGuildEmojisUpdateData {
    guild_id: string;
    emojis: APIGuildEmoji[];
}

export interface GatewayChannelPinsUpdateData {
    guild_id?: string;
    channel_id: string;
    /** ISO 8601 timestamp. `null` or absent once the last pin is removed. */
    last_pin_timestamp?: string | null;
}

/** A thread as sent in thread dispatches, which always carry the guild id. */
export interface GatewayThreadData extends APIChannel {
    guild_id: string;
}

export interface GatewayThreadCreateData extends GatewayThreadData {
    /** `false` or absent when the client was added to an existing thread rather than it being created. */
    newly_created?: boolean;
}

export interface GatewayThreadDeleteData {
    id: string;
    guild_id: string;
    parent_id: string;
    type: ChannelTypes;
}

/** A thread member as sent in thread dispatches, which always carry both ids. */
export interface GatewayThreadMember extends APIThreadMember {
    id: string;
    user_id: string;
}

/**
 * `THREAD_LIST_SYNC` body, sent when the client gains access to channels. `channel_ids` lists the parents
 * being synced; when absent, the whole guild is.
 */
export interface GatewayThreadListSyncData {
    guild_id: string;
    channel_ids?: string[];
    /** Every active thread in the synced parents. */
    threads: APIChannel[];
    /** The client's own membership in each synced thread it has joined. */
    members: GatewayThreadMember[];
}

export interface GatewayThreadMemberUpdateData extends GatewayThreadMember {
    guild_id: string;
}

export interface GatewayThreadMembersUpdateData {
    /** Thread id. */
    id: string;
    guild_id: string;
    /** Stops counting at 50. */
    member_count: number;
    added_members?: GatewayThreadMember[];
    removed_member_ids?: string[];
}

/** `MESSAGE_CREATE` and `MESSAGE_UPDATE` body: the message plus the guild it is in, and the author's and mentioned users' guild memberships. */
export interface GatewayMessageCreateData extends Omit<APIMessage, 'mentions'> {
    guild_id?: string;
    /** Guild messages only. Left out for webhooks. */
    member?: GatewayMessageMember;
    /** Each user carries their guild membership in guild messages. */
    mentions: (APIMessage['mentions'][number] & { member?: GatewayMessageMember })[];
}

export interface GatewayMessageDeleteData {
    id: string;
    channel_id: string;
    guild_id?: string;
}

export interface GatewayMessageDeleteBulkData {
    ids: string[];
    channel_id: string;
    guild_id?: string;
}

export interface GatewayMessageReactionRemoveData {
    user_id: string;
    channel_id: string;
    message_id: string;
    guild_id?: string;
    emoji: APIReactionEmoji;
    /** Whether it is a super reaction. */
    burst: boolean;
    type: ReactionTypes;
}

export interface GatewayMessageReactionAddData extends GatewayMessageReactionRemoveData {
    /** Guild reactions only. */
    member?: APIGuildMember;
    message_author_id?: string;
    /** Super reactions only: hex colors used to render the animation. */
    burst_colors?: string[];
}

export interface GatewayMessageReactionRemoveAllData {
    channel_id: string;
    message_id: string;
    guild_id?: string;
}

export interface GatewayMessageReactionRemoveEmojiData {
    channel_id: string;
    message_id: string;
    guild_id?: string;
    emoji: APIReactionEmoji;
}

export interface GatewayTypingStartData {
    channel_id: string;
    guild_id?: string;
    user_id: string;
    /** Unix seconds. */
    timestamp: number;
    /** Guild channels only. */
    member?: APIGuildMember;
}

export interface GatewayMessagePollVoteData {
    user_id: string;
    channel_id: string;
    message_id: string;
    guild_id?: string;
    answer_id: number;
}

/** Body of every dispatch the library handles, keyed by the payload's `t`. */
export interface GatewayDispatchData {
    GUILD_CREATE: GatewayGuildCreateData;
    GUILD_UPDATE: APIGuild;
    GUILD_DELETE: GatewayGuildDeleteData;
    GUILD_ROLE_CREATE: GatewayGuildRoleData;
    GUILD_ROLE_UPDATE: GatewayGuildRoleData;
    GUILD_ROLE_DELETE: GatewayGuildRoleDeleteData;
    GUILD_MEMBER_ADD: GatewayGuildMemberAddData;
    GUILD_MEMBER_UPDATE: GatewayGuildMemberUpdateData;
    GUILD_MEMBER_REMOVE: GatewayGuildMemberRemoveData;
    GUILD_BAN_ADD: GatewayGuildBanData;
    GUILD_BAN_REMOVE: GatewayGuildBanData;
    GUILD_EMOJIS_UPDATE: GatewayGuildEmojisUpdateData;
    CHANNEL_CREATE: APIChannel;
    CHANNEL_UPDATE: APIChannel;
    CHANNEL_DELETE: APIChannel;
    CHANNEL_PINS_UPDATE: GatewayChannelPinsUpdateData;
    THREAD_CREATE: GatewayThreadCreateData;
    THREAD_UPDATE: GatewayThreadData;
    THREAD_DELETE: GatewayThreadDeleteData;
    THREAD_LIST_SYNC: GatewayThreadListSyncData;
    THREAD_MEMBER_UPDATE: GatewayThreadMemberUpdateData;
    THREAD_MEMBERS_UPDATE: GatewayThreadMembersUpdateData;
    MESSAGE_CREATE: GatewayMessageCreateData;
    MESSAGE_UPDATE: GatewayMessageCreateData;
    MESSAGE_DELETE: GatewayMessageDeleteData;
    MESSAGE_DELETE_BULK: GatewayMessageDeleteBulkData;
    MESSAGE_REACTION_ADD: GatewayMessageReactionAddData;
    MESSAGE_REACTION_REMOVE: GatewayMessageReactionRemoveData;
    MESSAGE_REACTION_REMOVE_ALL: GatewayMessageReactionRemoveAllData;
    MESSAGE_REACTION_REMOVE_EMOJI: GatewayMessageReactionRemoveEmojiData;
    MESSAGE_POLL_VOTE_ADD: GatewayMessagePollVoteData;
    MESSAGE_POLL_VOTE_REMOVE: GatewayMessagePollVoteData;
    TYPING_START: GatewayTypingStartData;
    INTERACTION_CREATE: APIInteraction;
}
