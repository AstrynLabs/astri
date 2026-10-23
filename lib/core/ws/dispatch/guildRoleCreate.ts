import type { DispatchHandler } from '../../../types';
import { Role } from '../../structures';

export const guildRoleCreate: DispatchHandler<'GUILD_ROLE_CREATE'> = (client, data) => {
    const role = new Role(client, data.role, data.guild_id);
    client.guilds.get(data.guild_id)?.roles.set(role.id, role);
    client.emit('guildRoleCreate', role);
};
