import type { ChannelFlags } from 'discord-api-types/v10';
import { ChannelType } from 'discord-api-types/v10';
import Base from './Base';
import type Client from '../Client';
import ChannelFlagBitfield from '../util/ChannelFlagBitfield';
import type PrivateChannel from './PrivateChannel';
import type { VoiceBasedChannel, GuildBasedChannel, TextBasedChannel } from '../interfaces/Types';
import type ThreadChannel from './ThreadChannel';
import type ForumChannel from './ForumChannel';
import type PartialChannel from './PartialChannel';
import type MediaChannel from './MediaChannel';

interface ChannelBase {
  id: string;
  type?: ChannelType;
  flags?: ChannelFlags;
}

export default class BaseChannel extends Base {
  client: Client;
  type: ChannelType | null;
  flags: ChannelFlagBitfield;
  constructor(data: ChannelBase, client: Client) {
    super(data.id);
    this.client = client;
    this.type = data.type ?? null;
    this.update(data);
  }

  update(data: ChannelBase): void {
    if (data.flags) {
      this.flags = new ChannelFlagBitfield(data.flags);
    } else {
      this.flags ??= new ChannelFlagBitfield();
    }
  }

  get url(): string {
    return `https://discord.com/channels/${this.inGuild() ? this.guild.id : '@me'}/${this.id}`;
  }

  get mention(): string {
    return `<#${this.id}>`;
  }

  toString(): string {
    return `<#${this.id}>`;
  }

  delete(reason?: string) {
    return this.client.deleteChannel(this.id, reason);
  }

  isPartial(): this is PartialChannel {
    return this.type === null;
  }

  isDMBased(): this is PrivateChannel {
    return !this.isPartial() && [ChannelType.DM, ChannelType.GroupDM].includes(this.type!);
  }

  isTextBased(): this is TextBasedChannel {
    return 'messages' in this;
  }

  isVoiceBased(): this is VoiceBasedChannel {
    return 'bitrate' in this;
  }

  isThread(): this is ThreadChannel {
    return !this.isPartial() && [ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread].includes(this.type!);
  }

  isForum(): this is ForumChannel {
    return this.type === ChannelType.GuildForum;
  }

  isMedia(): this is MediaChannel {
    return this.type === ChannelType.GuildMedia;
  }

  inGuild(): this is GuildBasedChannel {
    return 'guild' in this;
  }

  toJSON(props: string[] = []) {
    return super.toJSON(['type', ...props]);
  }
}
