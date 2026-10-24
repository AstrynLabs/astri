import type { DispatchHandler } from '../../../types';
import { createChannel } from '../../structures';

export const channelDelete: DispatchHandler<'CHANNEL_DELETE'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const guild = guildId === null ? undefined : client.guilds.get(guildId);
    const channel = guild?.channels.get(data.id);
    guild?.channels.delete(data.id);
    guild?.threads.sweep((thread) => thread.parentId === data.id);
    client.emit('channelDelete', channel ?? createChannel(client, data, guildId));
};
