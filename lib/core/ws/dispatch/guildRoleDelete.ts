import type { DispatchHandler } from '../../../types';

export const guildRoleDelete: DispatchHandler<'GUILD_ROLE_DELETE'> = (client, data) => {
    const roles = client.guilds.get(data.guild_id)?.roles;
    const role = roles?.get(data.role_id) ?? null;
    roles?.delete(data.role_id);
    client.emit('guildRoleDelete', data.role_id, data.guild_id, role);
};
