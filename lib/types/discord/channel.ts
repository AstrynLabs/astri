import type { ChannelTypes } from '../../constants';
import type { APIGuildMember } from './member';
import type { components } from './openapi';
import type { APIUser } from './user';

export interface APIOverwrite {
    /** Role or user id. */
    id: string;
    /** `0` for a role, `1` for a member. */
    type: 0 | 1;
    /** Permission bitfield, serialized as a decimal string. */
    allow: string;
    /** Permission bitfield, serialized as a decimal string. */
    deny: string;
}

/** A tag that can be applied to posts in a forum or media channel. */
export interface APIForumTag {
    id: string;
    name: string;
    moderated: boolean;
    emoji_id: string | null;
    emoji_name: string | null;
}

export interface APIDefaultReaction {
    emoji_id: string | null;
    emoji_name: string | null;
}

export interface APIThreadMetadata {
    archived: boolean;
    /** Minutes of inactivity before the thread archives itself. */
    auto_archive_duration: number;
    /** ISO 8601 timestamp of the last archive status change. */
    archive_timestamp: string;
    /** Only members with the manage threads permission can unarchive it. */
    locked: boolean;
    /** Private threads only: whether non-moderators can add other non-moderators. */
    invitable?: boolean;
    /** ISO 8601 timestamp. Only set for threads created after 2022-01-09. */
    create_timestamp?: string | null;
}

/** A user's membership in a thread. */
export interface APIThreadMember {
    /** Thread id. Left out of the member inside each thread in `GUILD_CREATE`. */
    id?: string;
    /** Left out of the member inside each thread in `GUILD_CREATE`. */
    user_id?: string;
    /** ISO 8601 timestamp. */
    join_timestamp: string;
    flags: number;
    /** The guild member, only sent when requested or in `THREAD_MEMBERS_UPDATE` with the guild members intent. */
    member?: APIGuildMember;
}

/** Any channel. Which optional fields are present depends on `type`. */
export interface APIChannel {
    id: string;
    type: ChannelTypes;
    /** Left out of the channels inside `GUILD_CREATE`. */
    guild_id?: string;
    position?: number;
    permission_overwrites?: APIOverwrite[];
    name?: string | null;
    topic?: string | null;
    nsfw?: boolean;
    last_message_id?: string | null;
    bitrate?: number;
    user_limit?: number;
    /** Slowmode, in seconds. */
    rate_limit_per_user?: number;
    recipients?: APIUser[];
    icon?: string | null;
    owner_id?: string;
    application_id?: string;
    /** Category id, or the parent channel for threads. */
    parent_id?: string | null;
    /** ISO 8601 timestamp. */
    last_pin_timestamp?: string | null;
    rtc_region?: string | null;
    video_quality_mode?: number;
    /** Voice channels only: the topic shown while people are connected. */
    status?: string | null;
    /** Minutes. */
    default_auto_archive_duration?: number;
    flags?: number;
    available_tags?: APIForumTag[];
    default_reaction_emoji?: APIDefaultReaction | null;
    default_thread_rate_limit_per_user?: number;
    default_sort_order?: number | null;
    default_forum_layout?: number;
    /** Threads only. */
    thread_metadata?: APIThreadMetadata;
    /** Threads only: the client's own membership, if it has joined. */
    member?: APIThreadMember;
    /** Threads only. Excludes the starter message and deleted messages. */
    message_count?: number;
    /** Threads only. Stops counting at 50. */
    member_count?: number;
    /** Threads only. Like `message_count`, but never goes down when messages are deleted. */
    total_message_sent?: number;
    /** Forum and media threads only: ids of the parent's `available_tags` applied to the post. */
    applied_tags?: string[];
}

/** A page of threads with the client's own membership in each it joined. */
export type APIThreadList = components['schemas']['ThreadsResponse'];
export type APIThreadSearchResult = components['schemas']['ThreadSearchResponse'];
export type APIFollowedChannel = components['schemas']['ChannelFollowerResponse'];
