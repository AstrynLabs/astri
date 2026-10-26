import type { BaseGuildTextChannel, BaseGuildVoiceChannel, PrivateChannel, ThreadChannel } from '../core/structures';

/** Any channel that holds messages: text, announcement, voice and stage channels, threads, and DMs. */
export type TextBasedChannel = BaseGuildTextChannel | BaseGuildVoiceChannel | ThreadChannel | PrivateChannel;
