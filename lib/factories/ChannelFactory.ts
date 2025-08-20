import type Client from '../Client';
import { ChannelType } from 'discord-api-types/v10';
import type { APIChannel, APIDMChannel, APIGroupDMChannel } from 'discord-api-types/v10';
import type { GuildTextChannelData, ChannelTypes as Channel } from '../interfaces/Types';
import CategoryChannel from '../structures/CategoryChannel';
import ForumChannel from '../structures/ForumChannel';
import GuildChannel from '../structures/GuildChannel';
import GuildTextChannel from '../structures/GuildTextChannel';
import MediaChannel from '../structures/MediaChannel';
import NewsChannel from '../structures/NewsChannel';
import NewsThreadChannel from '../structures/NewsThreadChannel';
import PartialChannel from '../structures/PartialChannel';
import PrivateChannel from '../structures/PrivateChannel';
import StageChannel from '../structures/StageChannel';
import VoiceTextChannel from '../structures/VoiceTextChannel';
import ThreadChannel from '../structures/ThreadChannel';

export default class ChannelFactory {
  static create(data: APIChannel | { id: string }, client: Client, guildID?: string): Channel {
    if (!('type' in data)) return new PartialChannel(data, client);
    switch (data.type) {
      case ChannelType.GuildText: {
        return new GuildTextChannel(data, client);
      }
      case ChannelType.DM: {
        return new PrivateChannel(data, client);
      }
      case ChannelType.GuildVoice: {
        return new VoiceTextChannel(data, client);
      }
      case ChannelType.GuildCategory: {
        return new CategoryChannel(data, client);
      }
      case ChannelType.GuildAnnouncement: {
        return new NewsChannel(data, client);
      }
      case ChannelType.GuildMedia: {
        return new MediaChannel(data, client);
      }
      case ChannelType.AnnouncementThread: {
        return new NewsThreadChannel(data, client);
      }
      case ChannelType.PublicThread:
      case ChannelType.PrivateThread: {
        return new ThreadChannel(data, client);
      }
      case ChannelType.GuildStageVoice: {
        return new StageChannel(data, client);
      }
      case ChannelType.GuildForum: {
        return new ForumChannel(data, client);
      }
    }
    if (guildID) {
      if (data.last_message_id !== undefined) {
        client.emit('warn', new Error(`Unknown guild text channel type: ${data.type}\n${JSON.stringify(data)}`));
        return new GuildTextChannel(data as unknown as GuildTextChannelData, client);
      }
      client.emit('warn', new Error(`Unknown guild channel type: ${data.type}\n${JSON.stringify(data)}`));
      return new GuildChannel(data as unknown as Exclude<APIChannel, APIDMChannel | APIGroupDMChannel>, client);
    }
    client.emit('warn', new Error(`Unknown channel type: ${data.type}\n${JSON.stringify(data)}`));
    return new PartialChannel(data, client);
  }
}
