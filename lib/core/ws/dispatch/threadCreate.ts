import type { DispatchHandler } from '../../../types';
import { upsertThread } from '../../structures';

export const threadCreate: DispatchHandler<'THREAD_CREATE'> = (client, data) => {
    client.emit('threadCreate', upsertThread(client, data, data.guild_id), data.newly_created ?? false);
};
