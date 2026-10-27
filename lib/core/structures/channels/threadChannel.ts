import type { ChannelTypes } from '../../../constants';
import type { PinnedMessages } from '../../../interfaces';
import type { APIChannel, APIThreadMember, ClientContext, MessageCreateData, MessageFetchOptions, PinFetchOptions, ThreadMemberFetchOptions } from '../../../types';
import type { Cache } from '../../cache';
import type { Guild } from '../guild';
import type { Member } from '../member';
import type { Message } from '../message';
import type { Permission } from '../permission';
import { ThreadMember } from '../threadMember';
import { bulkDeleteMessages, fetchMessage, fetchMessages, fetchPins, parseTimestamp, sendMessage } from '../util';
import { Channel } from './channel';
import { GuildChannel } from './guildChannel';

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
    /** Cached messages, filled as they are sent, edited or fetched. */
    readonly messages: Cache<string, Message>;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data);
        this.guildId = guildId;
        this.members = client.cache.create('threadMembers');
        this.messages = client.cache.create('messages');
    }

    /** The guild this thread belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /**
     * A member's permissions in this thread, which are those of its parent channel.
     *
     * @throws When the parent channel, its guild, or the member given by id, is not cached.
     */
    permissionsOf(member: Member | string): Permission {
        const parent = this.parentId === null ? undefined : this.guild?.channels.get(this.parentId);
        if (!(parent instanceof GuildChannel)) throw new Error(`Parent channel of thread ${this.id} is not cached`);
        return parent.permissionsOf(member);
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

    /** Sends a message. Needs the send messages permission. */
    send(data: string | MessageCreateData): Promise<Message> {
        return sendMessage(this.client, this.id, this.guildId, data);
    }

    /** Fetches one message. Needs the read message history permission. */
    fetchMessage(messageId: string): Promise<Message> {
        return fetchMessage(this.client, this.id, this.guildId, messageId);
    }

    /** Fetches up to 100 messages, newest first. Needs the read message history permission. */
    fetchMessages(options?: MessageFetchOptions): Promise<Message[]> {
        return fetchMessages(this.client, this.id, this.guildId, options);
    }

    /** Fetches one page of pins, newest first. */
    fetchPins(options?: PinFetchOptions): Promise<PinnedMessages> {
        return fetchPins(this.client, this.id, this.guildId, options);
    }

    /** Shows the client as typing for 10 seconds, or until it sends a message. */
    async sendTyping(): Promise<void> {
        await this.client.rest.post('channelTyping', this.id);
    }

    /** Deletes up to 100 messages younger than two weeks. Needs the manage messages permission. */
    bulkDelete(messageIds: string[], reason?: string): Promise<void> {
        return bulkDeleteMessages(this.client, this.id, messageIds, reason);
    }

    /** Adds the client's own user to the thread. Unarchives it if needed. */
    async join(): Promise<void> {
        await this.client.rest.put('channelCurrentThreadMember', this.id);
    }

    async leave(): Promise<void> {
        await this.client.rest.delete('channelCurrentThreadMember', this.id);
    }

    /** Needs the ability to send messages in the thread. Private threads also need the client to be a member. */
    async addMember(userId: string): Promise<void> {
        await this.client.rest.put('channelThreadMember', this.id, userId);
    }

    /** Needs the manage threads permission, or to be the creator of a private thread. */
    async removeMember(userId: string): Promise<void> {
        await this.client.rest.delete('channelThreadMember', this.id, userId);
    }

    /** Fetches one member and caches it on the thread. Needs the guild members intent. */
    async fetchMember(userId: string): Promise<ThreadMember> {
        const member = await this.client.rest.get('channelThreadMember', this.id, userId);
        return upsertThreadMember(this, member as APIThreadMember, userId);
    }

    /** Fetches members, in user id order, and caches them on the thread. Needs the guild members intent. */
    async fetchMembers(options?: ThreadMemberFetchOptions): Promise<ThreadMember[]> {
        const members = await this.client.rest.get('channelThreadMembers', this.id, options);
        return members.map((member) => upsertThreadMember(this, member as APIThreadMember, member.user_id));
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
