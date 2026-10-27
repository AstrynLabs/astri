import type { DispatchHandler } from '../../../types';
import { upsertPresence } from '../../structures';

export const presenceUpdate: DispatchHandler<'PRESENCE_UPDATE'> = (client, data) => {
    const old = client.guilds.get(data.guild_id)?.presences.get(data.user.id)?.clone() ?? null;
    client.emit('presenceUpdate', upsertPresence(client, data, data.guild_id), old);
};
