import type { DispatchHandler } from '../../../types';
import { createChannel } from '../../structures';

export const channelUpdate: DispatchHandler<'CHANNEL_UPDATE'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const channels = guildId === null ? undefined : client.guilds.get(guildId)?.channels;
    const channel = channels?.get(data.id);
    if (channel === undefined || channel.type !== data.type) {
        const created = createChannel(client, data, guildId);
        channels?.set(created.id, created);
        client.emit('channelUpdate', created, channel ?? null);
        return;
    }

    const old = channel.clone();
    channel.patch(data);
    client.emit('channelUpdate', channel, old);
};
