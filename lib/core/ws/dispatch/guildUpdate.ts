import type { DispatchHandler } from '../../../types';
import { Guild } from '../../structures';

export const guildUpdate: DispatchHandler<'GUILD_UPDATE'> = (client, data) => {
    const guild = client.guilds.get(data.id);
    if (guild === undefined) {
        const created = new Guild(client, data);
        client.guilds.set(created.id, created);
        client.emit('guildUpdate', created, null);
        return;
    }

    const old = guild.clone();
    guild.patch(data);
    client.emit('guildUpdate', guild, old);
};
