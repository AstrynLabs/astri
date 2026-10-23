import type { DispatchHandler } from '../../../types';
import { upsertUser } from '../../structures';

export const guildBanAdd: DispatchHandler<'GUILD_BAN_ADD'> = (client, data) => {
    client.emit('guildBanAdd', upsertUser(client, data.user), data.guild_id);
};
