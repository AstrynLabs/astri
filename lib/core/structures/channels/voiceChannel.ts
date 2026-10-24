import type { ChannelTypes } from '../../../constants';
import type { APIChannel, ClientContext } from '../../../types';
import { parseTimestamp } from '../util';
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
    }
}

export class VoiceChannel extends BaseGuildVoiceChannel {
    declare readonly type: typeof ChannelTypes.GuildVoice;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}

export class StageChannel extends BaseGuildVoiceChannel {
    declare readonly type: typeof ChannelTypes.GuildStageVoice;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}
