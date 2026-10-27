import type { DispatchHandler } from '../../../types';
import { createChannel, upsertGuildChannel } from '../../structures';

export const channelCreate: DispatchHandler<'CHANNEL_CREATE'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const channel = guildId === null ? createChannel(client, data, null) : upsertGuildChannel(client, data, guildId);
    client.emit('channelCreate', channel);
};
