import type { DispatchHandler } from '../../../types';

export const threadDelete: DispatchHandler<'THREAD_DELETE'> = (client, data) => {
    const threads = client.guilds.get(data.guild_id)?.threads;
    const thread = threads?.get(data.id) ?? null;
    threads?.delete(data.id);
    client.emit('threadDelete', data.id, data.guild_id, data.parent_id, thread);
};
