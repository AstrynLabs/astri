import type { DispatchHandler } from '../../../types';

export const webhooksUpdate: DispatchHandler<'WEBHOOKS_UPDATE'> = (client, data) => {
    const channel = client.guilds.get(data.guild_id)?.channels.get(data.channel_id) ?? null;
    client.emit('webhooksUpdate', data.channel_id, data.guild_id, channel);
};
