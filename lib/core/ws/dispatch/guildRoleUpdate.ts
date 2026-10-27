import type { DispatchHandler } from '../../../types';
import { Role } from '../../structures';

export const guildRoleUpdate: DispatchHandler<'GUILD_ROLE_UPDATE'> = (client, data) => {
    const roles = client.guilds.get(data.guild_id)?.roles;
    const role = roles?.get(data.role.id);
    if (role === undefined) {
        const created = new Role(client, data.role, data.guild_id);
        roles?.set(created.id, created);
        client.emit('guildRoleUpdate', created, null);
        return;
    }

    const old = role.clone();
    role.patch(data.role);
    client.emit('guildRoleUpdate', role, old);
};
