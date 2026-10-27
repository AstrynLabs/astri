import type { DispatchHandler } from '../../../types';
import { Guild } from '../../structures';

export const guildCreate: DispatchHandler<'GUILD_CREATE'> = (client, data) => {
    if (data.unavailable) {
        const guild = client.guilds.get(data.id) ?? null;
        client.guilds.delete(data.id);
        client.unavailableGuilds.add(data.id);
        client.emit('guildUnavailable', data.id, guild);
        return;
    }

    let guild = client.guilds.peek(data.id);
    if (guild !== undefined) guild.patch(data);
    else {
        guild = new Guild(client, data);
        client.guilds.set(guild.id, guild);
    }

    if (client.unavailableGuilds.delete(data.id)) client.emit('guildAvailable', guild);
    else client.emit('guildCreate', guild);
};
