import type { DispatchHandler } from '../../../types';

export const guildDelete: DispatchHandler<'GUILD_DELETE'> = (client, data) => {
    const guild = client.guilds.get(data.id) ?? null;
    client.guilds.delete(data.id);

    if (data.unavailable) {
        client.unavailableGuilds.add(data.id);
        client.emit('guildUnavailable', data.id, guild);
    } else {
        client.unavailableGuilds.delete(data.id);
        client.emit('guildDelete', data.id, guild);
    }
};
