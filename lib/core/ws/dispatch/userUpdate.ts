import type { DispatchHandler } from '../../../types';
import { upsertUser } from '../../structures';

export const userUpdate: DispatchHandler<'USER_UPDATE'> = (client, data) => {
    const old = client.user?.clone() ?? null;
    const user = upsertUser(client, data);
    if (client.user !== null && client.user !== user) client.user.patch(data);
    client.emit('userUpdate', client.user ?? user, old);
};
