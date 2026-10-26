import type { ChannelTypes } from '../../../constants';
import type { APIChannel, ClientContext } from '../../../types';
import type { Cache } from '../../cache';
import type { Message } from '../message';
import { parseTimestamp } from '../util';
import { GuildChannel } from './guildChannel';

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
