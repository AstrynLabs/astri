import type { VoiceChannelEffectAnimationTypes } from '../constants';
import type { ReactionEmoji } from './message';

/** Someone in a voice channel sent an emoji reaction, or played a soundboard sound. */
export interface VoiceChannelEffect {
    channelId: string;
    guildId: string;
    userId: string;
    emoji: ReactionEmoji | null;
    animationType: VoiceChannelEffectAnimationTypes | null;
    animationId: number | null;
    /** Soundboard sounds only. Default sounds may have a numeric id, given here as a string. */
    soundId: string | null;
    /** Soundboard sounds only. From 0 to 1. */
    soundVolume: number | null;
}
