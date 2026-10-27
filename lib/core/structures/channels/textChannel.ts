import type { ChannelTypes } from '../../../constants';
import type { PinnedMessages } from '../../../interfaces';
import type { APIChannel, ClientContext, MessageCreateData, MessageFetchOptions, PinFetchOptions, ThreadCreateData } from '../../../types';
import type { Cache } from '../../cache';
import type { Message } from '../message';
import { bulkDeleteMessages, fetchMessage, fetchMessages, fetchPins, parseTimestamp, sendMessage } from '../util';
import { upsertThread } from './factory';
import { GuildChannel } from './guildChannel';
import type { ThreadChannel } from './threadChannel';

/** Shared fields of text and announcement channels. */
export abstract class BaseGuildTextChannel extends GuildChannel {
    topic: string | null = null;
    nsfw = false;
    lastMessageId: string | null = null;
    /** Unix ms of the latest pin, or `null`. */
    lastPinTimestamp: number | null = null;
    /** Slowmode, in seconds. */
    rateLimitPerUser = 0;
    /** Minutes. */
    defaultAutoArchiveDuration: number | null = null;
    /** Slowmode, in seconds, given to new threads. */
    defaultThreadRateLimitPerUser: number | null = null;
    /** Cached messages, filled as they are sent, edited or fetched. */
    readonly messages: Cache<string, Message>;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.messages = client.cache.create('messages');
    }

    override patch(data: Partial<APIChannel>): void {
        super.patch(data);
        if (data.topic !== undefined) this.topic = data.topic;
        if (data.nsfw !== undefined) this.nsfw = data.nsfw;
        if (data.last_message_id !== undefined) this.lastMessageId = data.last_message_id;
        if (data.last_pin_timestamp !== undefined) this.lastPinTimestamp = parseTimestamp(data.last_pin_timestamp);
        if (data.rate_limit_per_user !== undefined) this.rateLimitPerUser = data.rate_limit_per_user;
        if (data.default_auto_archive_duration !== undefined) this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
        if (data.default_thread_rate_limit_per_user !== undefined) this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user;
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

    /** Creates a thread not started from a message. Needs the create public or private threads permission. */
    async createThread(data: ThreadCreateData, reason?: string): Promise<ThreadChannel> {
        return upsertThread(this.client, (await this.client.rest.post('channelThreads', this.id, data, reason)) as APIChannel, this.guildId);
    }
}

export class TextChannel extends BaseGuildTextChannel {
    declare readonly type: typeof ChannelTypes.GuildText;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}

/** A channel other guilds can follow to have its messages crossposted to them. */
export class AnnouncementChannel extends BaseGuildTextChannel {
    declare readonly type: typeof ChannelTypes.GuildAnnouncement;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}
