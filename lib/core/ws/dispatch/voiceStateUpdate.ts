import type { DispatchHandler } from '../../../types';
import { upsertVoiceState } from '../../structures';

export const voiceStateUpdate: DispatchHandler<'VOICE_STATE_UPDATE'> = (client, data) => {
    if (data.guild_id == null) return;
    const old = client.guilds.get(data.guild_id)?.voiceStates.get(data.user_id)?.clone() ?? null;
    client.emit('voiceStateUpdate', upsertVoiceState(client, data, data.guild_id), old);
};
