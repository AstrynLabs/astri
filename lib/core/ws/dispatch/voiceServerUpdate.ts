import type { DispatchHandler } from '../../../types';

export const voiceServerUpdate: DispatchHandler<'VOICE_SERVER_UPDATE'> = (client, data) => {
    client.emit('voiceServerUpdate', data.guild_id, data.token, data.endpoint);
};
