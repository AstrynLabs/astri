import type { DispatchHandler } from '../../../types';
import { upsertUser } from '../../structures';

export const guildBanRemove: DispatchHandler<'GUILD_BAN_REMOVE'> = (client, data) => {
    client.emit('guildBanRemove', upsertUser(client, data.user), data.guild_id);
};
