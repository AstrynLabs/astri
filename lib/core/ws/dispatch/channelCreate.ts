import type { DispatchHandler } from '../../../types';
import { createChannel } from '../../structures';

export const channelCreate: DispatchHandler<'CHANNEL_CREATE'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const channel = createChannel(client, data, guildId);
    if (guildId !== null) client.guilds.get(guildId)?.channels.set(channel.id, channel);
    client.emit('channelCreate', channel);
};
