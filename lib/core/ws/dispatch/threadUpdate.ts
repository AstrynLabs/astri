import type { DispatchHandler } from '../../../types';
import { createThreadChannel } from '../../structures';

export const threadUpdate: DispatchHandler<'THREAD_UPDATE'> = (client, data) => {
    const threads = client.guilds.get(data.guild_id)?.threads;
    const thread = threads?.get(data.id);
    if (thread === undefined || thread.type !== data.type) {
        const created = createThreadChannel(client, data, data.guild_id);
        threads?.set(created.id, created);
        client.emit('threadUpdate', created, thread ?? null);
        return;
    }

    const old = thread.clone();
    thread.patch(data);
    client.emit('threadUpdate', thread, old);
};
