import type { DispatchHandler } from '../../../types';
import { upsertThread, upsertThreadMember } from '../../structures';

export const threadListSync: DispatchHandler<'THREAD_LIST_SYNC'> = (client, data) => {
    const channelIds = data.channel_ids ?? null;
    const guild = client.guilds.get(data.guild_id);
    if (guild !== undefined) {
        const synced = new Set(data.threads.map((thread) => thread.id));
        const parents = channelIds === null ? null : new Set(channelIds);
        guild.threads.sweep((thread, id) => !synced.has(id) && (parents === null || (thread.parentId !== null && parents.has(thread.parentId))));
    }

    const threads = new Map(data.threads.map((thread) => [thread.id, upsertThread(client, thread, data.guild_id)]));
    for (const member of data.members) {
        const thread = threads.get(member.id);
        if (thread !== undefined) upsertThreadMember(thread, member, member.user_id);
    }
    client.emit('threadListSync', data.guild_id, [...threads.values()], channelIds);
};
