import type { DispatchHandler } from '../../../types';
import { toVoiceChannelEffect } from '../../structures/util';

export const voiceChannelEffectSend: DispatchHandler<'VOICE_CHANNEL_EFFECT_SEND'> = (client, data) => {
    client.emit('voiceChannelEffectSend', toVoiceChannelEffect(data));
};
