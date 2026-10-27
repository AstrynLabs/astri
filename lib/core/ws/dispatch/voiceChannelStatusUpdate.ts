import type { DispatchHandler } from '../../../types';

export const voiceChannelStatusUpdate: DispatchHandler<'VOICE_CHANNEL_STATUS_UPDATE'> = (client, data) => {
    const channel = client.guilds.get(data.guild_id)?.channels.get(data.id) ?? null;
    channel?.patch({ status: data.status });
    client.emit('voiceChannelStatusUpdate', data.id, data.guild_id, data.status, channel);
};
