import type { DispatchHandler } from '../../../types';
import { upsertRole } from '../../structures';

export const guildRoleCreate: DispatchHandler<'GUILD_ROLE_CREATE'> = (client, data) => {
    client.emit('guildRoleCreate', upsertRole(client, data.role, data.guild_id));
};
