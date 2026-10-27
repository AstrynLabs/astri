import type { DispatchHandler } from '../../../types';
import { upsertExtendedUser } from '../../structures';

export const userUpdate: DispatchHandler<'USER_UPDATE'> = (client, data) => {
    const old = client.user?.clone() ?? null;
    client.emit('userUpdate', upsertExtendedUser(client, data), old);
};
