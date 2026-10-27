import type { ChannelTypes } from '../../../constants';
import type { PinnedMessages } from '../../../interfaces';
import type { APIChannel, APIStageInstance, ClientContext, MessageCreateData, MessageFetchOptions, PinFetchOptions, StageInstanceCreateData } from '../../../types';
import type { Cache } from '../../cache';
import type { Message } from '../message';
import { upsertStageInstance, type StageInstance } from '../stageInstance';
import { bulkDeleteMessages, fetchMessage, fetchMessages, fetchPins, parseTimestamp, sendMessage } from '../util';
import { GuildChannel } from './guildChannel';

/** Shared fields of voice and stage channels, including their built-in text chat. */
export abstract class BaseGuildVoiceChannel extends GuildChannel {
    /** Bits per second. */
    bitrate: number;
    /** `0` means no limit. */
    userLimit = 0;
    /** Voice region override. `null` picks automatically. */
    rtcRegion: string | null = null;
    /** `1` picks automatically, `2` is 720p. */
    videoQualityMode = 1;
    nsfw = false;
    lastMessageId: string | null = null;
    /** Unix ms of the latest pin, or `null`. */
    lastPinTimestamp: number | null = null;
    /** Slowmode, in seconds. */
    rateLimitPerUser = 0;
    /** Cached messages from the built-in text chat, filled as they are sent, edited or fetched. */
    readonly messages: Cache<string, Message>;
    /** Voice channels only: the topic shown while people are connected, or `null`. */
    status: string | null = null;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.messages = client.cache.create('messages');
    }

    override patch(data: Partial<APIChannel>): void {
        super.patch(data);
        if (data.bitrate !== undefined) this.bitrate = data.bitrate;
        if (data.user_limit !== undefined) this.userLimit = data.user_limit;
        if (data.rtc_region !== undefined) this.rtcRegion = data.rtc_region;
        if (data.video_quality_mode !== undefined) this.videoQualityMode = data.video_quality_mode;
        if (data.nsfw !== undefined) this.nsfw = data.nsfw;
        if (data.last_message_id !== undefined) this.lastMessageId = data.last_message_id;
        if (data.last_pin_timestamp !== undefined) this.lastPinTimestamp = parseTimestamp(data.last_pin_timestamp);
        if (data.rate_limit_per_user !== undefined) this.rateLimitPerUser = data.rate_limit_per_user;
        if (data.status !== undefined) this.status = data.status;
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
}

export class VoiceChannel extends BaseGuildVoiceChannel {
    declare readonly type: typeof ChannelTypes.GuildVoice;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }

    /** Sets the topic shown while people are connected, or clears it with `null`. Needs the set voice channel status permission, and to be connected unless the client can manage channels. */
    async setStatus(status: string | null, reason?: string): Promise<void> {
        await this.client.rest.put('channelVoiceStatus', this.id, { status }, reason);
    }

    /**
     * Plays a soundboard sound for everyone connected. The client must be connected, not muted or deafened, and have
     * the speak and use soundboard permissions. Sounds from another guild, given as `sourceGuildId`, also need the use
     * external sounds permission.
     */
    async sendSoundboardSound(soundId: string, sourceGuildId?: string): Promise<void> {
        await this.client.rest.post('channelSendSoundboardSound', this.id, { sound_id: soundId, source_guild_id: sourceGuildId });
    }
}

export class StageChannel extends BaseGuildVoiceChannel {
    declare readonly type: typeof ChannelTypes.GuildStageVoice;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }

    /** Starts a stage and caches it. Needs to be a stage moderator: the manage channels, mute members and move members permissions. */
    async createStageInstance(data: StageInstanceCreateData, reason?: string): Promise<StageInstance> {
        const stageInstance = await this.client.rest.post('stageInstance', { ...data, channel_id: this.id }, reason);
        return upsertStageInstance(this.client, stageInstance as APIStageInstance);
    }
}
