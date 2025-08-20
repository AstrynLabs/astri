import type CategoryChannel from '../structures/CategoryChannel';
import type NewsChannel from '../structures/NewsChannel';
import type NewsThreadChannel from '../structures/NewsThreadChannel';
import type PrivateChannel from '../structures/PrivateChannel';
import type VoiceTextChannel from '../structures/VoiceTextChannel';
import type { APIChannel, APIDMChannel, APIGroupDMChannel, APIGuildCategoryChannel, APIGuildStageVoiceChannel, APIGuildVoiceChannel } from 'discord-api-types/v10';
import type MediaChannel from '../structures/MediaChannel';
import type Guild from '../structures/Guild';
import type BaseChannel from '../structures/BaseChannel';
import type GuildChannel from '../structures/GuildChannel';
import type GuildTextChannel from '../structures/GuildTextChannel';
import type GuildVoiceChannel from '../structures/GuildVoiceChannel';
import type ForumChannel from '../structures/ForumChannel';
import type Message from '../structures/Message';
import type Collection from '../util/Collection';
import type PartialChannel from '../structures/PartialChannel';
import type ThreadChannel from '../structures/ThreadChannel';

export type ChannelTypes = CategoryChannel | PrivateChannel | VoiceTextChannel | NewsChannel | NewsThreadChannel | ThreadChannel | GuildChannel | MediaChannel | BaseChannel | GuildTextChannel | GuildVoiceChannel | ForumChannel | PartialChannel;

export type TextBasedChannel = Extract<ChannelTypes, { messages: Collection<Message> }>;
export type VoiceBasedChannel = Extract<ChannelTypes, { bitrate: number }>;
export type GuildBasedChannel = Extract<ChannelTypes, { guild: Guild }>;
export type GuildTextChannelData = Exclude<APIChannel, APIDMChannel | APIGroupDMChannel | APIGuildVoiceChannel | APIGuildStageVoiceChannel | APIGuildCategoryChannel>;
