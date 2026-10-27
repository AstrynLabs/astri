import type { DispatchHandler } from '../../../types';
import { upsertInvite } from '../../structures';

export const inviteCreate: DispatchHandler<'INVITE_CREATE'> = (client, data) => {
    client.emit('inviteCreate', upsertInvite(client, data));
};
