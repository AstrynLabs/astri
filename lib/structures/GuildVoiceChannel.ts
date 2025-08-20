import type { APIGuildStageVoiceChannel, APIGuildVoiceChannel, VideoQualityMode } from 'discord-api-types/v10';
import GuildChannel from './GuildChannel';
import type Client from '../Client';
import Collection from '../util/Collection';
import Member from './Member';

export default class GuildVoiceChannel extends GuildChannel {
  voiceMembers = new Collection(Member);
  bitrate = 64_000;
  rtcRegion: string | null = null;
  userLimit?: number;
  videoQualityMode?: VideoQualityMode;
  constructor(data: APIGuildVoiceChannel | APIGuildStageVoiceChannel, client: Client) {
    super(data, client);
    this.update(data);
  }

  update(data: APIGuildVoiceChannel | APIGuildStageVoiceChannel) {
    super.update(data);

    if (data.bitrate !== undefined) {
      this.bitrate = data.bitrate;
    }
    if (data.rtc_region !== undefined) {
      this.rtcRegion = data.rtc_region;
    }
    if (data.user_limit !== undefined) {
      this.userLimit = data.user_limit;
    }
    if (data.video_quality_mode !== undefined) {
      this.videoQualityMode = data.video_quality_mode;
    }
  }

  join(options?: { opusOnly?: boolean; shared?: boolean; selfMute?: boolean; selfDeaf?: boolean }) {
    return this.client.joinVoiceChannel(this.id, options);
  }

  leave() {
    return this.client.leaveVoiceChannel(this.id);
  }

  toJSON(props: string[] = []) {
    return super.toJSON(['bitrate', 'rtcRegion', 'userLimit', 'videoQualityMode', 'voiceMembers', ...props]);
  }
}
