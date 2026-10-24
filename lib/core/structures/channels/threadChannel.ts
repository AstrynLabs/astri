import type { ChannelTypes } from '../../../constants';
import type { APIChannel, APIThreadMember, ClientContext } from '../../../types';
import type { Cache } from '../../cache';
import type { Guild } from '../guild';
import { ThreadMember } from '../threadMember';
import { parseTimestamp } from '../util';
import { Channel } from './channel';

/** Shared fields of every kind of thread. Threads are cached in their guild's `threads`, not `channels`. */
export abstract class ThreadChannel extends Channel {
    readonly guildId: string;
    name: string;
    /** The text, announcement, forum or media channel the thread was created in. */
    parentId: string | null = null;
    /** Who started the thread. */
    ownerId: string | null = null;
    lastMessageId: string | null = null;
    /** Unix ms of the latest pin, or `null`. */
    lastPinTimestamp: number | null = null;
    /** Slowmode, in seconds. */
    rateLimitPerUser = 0;
    /** Excludes the starter message and deleted messages. */
    messageCount = 0;
    /** Never goes down when messages are deleted. */
    totalMessageSent = 0;
    /** Stops counting at 50. */
    memberCount = 0;
    /** Forum and media posts only: ids of the parent's `availableTags` applied to the post. */
    appliedTags: string[] = [];
    archived = false;
    /** Minutes of inactivity before the thread archives itself. */
    autoArchiveDuration = 1440;
    /** Unix ms of the last archive status change. */
    archiveTimestamp: number | null = null;
    /** Only members with the manage threads permission can unarchive it. */
    locked = false;
    /** Unix ms. `null` for threads created before 2022-01-09. */
    createTimestamp: number | null = null;
    /** The client's own membership, or `null` if it has not joined. */
    member: ThreadMember | null = null;
    /** Cached members. Others than the client only arrive through `THREAD_MEMBERS_UPDATE`, which needs the guild members intent. */
    readonly members: Cache<string, ThreadMember>;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data);
        this.guildId = guildId;
        this.members = client.cache.create('threadMembers');
    }

    /** The guild this thread belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** The channel the thread was created in, if cached. */
    get parent(): Channel | undefined {
        return this.parentId === null ? undefined : this.guild?.channels.get(this.parentId);
    }

    override patch(data: Partial<APIChannel>): void {
        super.patch(data);
        if (typeof data.name === 'string') this.name = data.name;
        if (data.parent_id !== undefined) this.parentId = data.parent_id;
        if (data.owner_id !== undefined) this.ownerId = data.owner_id;
        if (data.last_message_id !== undefined) this.lastMessageId = data.last_message_id;
        if (data.last_pin_timestamp !== undefined) this.lastPinTimestamp = parseTimestamp(data.last_pin_timestamp);
        if (data.rate_limit_per_user !== undefined) this.rateLimitPerUser = data.rate_limit_per_user;
        if (data.message_count !== undefined) this.messageCount = data.message_count;
        if (data.total_message_sent !== undefined) this.totalMessageSent = data.total_message_sent;
        if (data.member_count !== undefined) this.memberCount = data.member_count;
        if (data.applied_tags !== undefined) this.appliedTags = data.applied_tags;
        if (data.thread_metadata !== undefined) {
            this.archived = data.thread_metadata.archived;
            this.autoArchiveDuration = data.thread_metadata.auto_archive_duration;
            this.archiveTimestamp = Date.parse(data.thread_metadata.archive_timestamp);
            this.locked = data.thread_metadata.locked;
            if (data.thread_metadata.create_timestamp !== undefined) this.createTimestamp = parseTimestamp(data.thread_metadata.create_timestamp);
        }
        if (data.member !== undefined) {
            const userId = data.member.user_id ?? this.client.user?.id;
            if (userId !== undefined) upsertThreadMember(this, data.member, userId);
        }
    }
}

/** A thread in an announcement channel. */
export class AnnouncementThreadChannel extends ThreadChannel {
    declare readonly type: typeof ChannelTypes.AnnouncementThread;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}

/** A thread in a text channel, or a post in a forum or media channel. */
export class PublicThreadChannel extends ThreadChannel {
    declare readonly type: typeof ChannelTypes.PublicThread;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}

/** A thread only visible to its members and to moderators. */
export class PrivateThreadChannel extends ThreadChannel {
    declare readonly type: typeof ChannelTypes.PrivateThread;
    /** Whether non-moderators can add other non-moderators. */
    invitable = true;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }

    override patch(data: Partial<APIChannel>): void {
        super.patch(data);
        if (data.thread_metadata?.invitable !== undefined) this.invitable = data.thread_metadata.invitable;
    }
}

/**
 * The thread's cached member for `userId` patched with `data`, or a new one, cached if the thread members cache
 * is enabled. Keeps `thread.member` current when `userId` is the client's own.
 */
export function upsertThreadMember(thread: ThreadChannel, data: APIThreadMember, userId: string): ThreadMember {
    let member = thread.members.get(userId);
    if (member !== undefined) member.patch(data);
    else {
        member = new ThreadMember(thread.client, data, thread.id, thread.guildId, userId);
        thread.members.set(userId, member);
    }
    if (userId === thread.client.user?.id) thread.member = member;
    return member;
}

/** Drops `userId` from the thread's members, clearing `thread.member` when it is the client's own. */
export function removeThreadMember(thread: ThreadChannel, userId: string): void {
    thread.members.delete(userId);
    if (thread.member?.id === userId) thread.member = null;
}
