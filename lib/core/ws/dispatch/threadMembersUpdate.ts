import type { DispatchHandler } from '../../../types';
import { removeThreadMember, ThreadMember, upsertThreadMember } from '../../structures';

export const threadMembersUpdate: DispatchHandler<'THREAD_MEMBERS_UPDATE'> = (client, data) => {
    const thread = client.guilds.get(data.guild_id)?.threads.get(data.id) ?? null;
    const removedIds = data.removed_member_ids ?? [];
    const added = (data.added_members ?? []).map((member) => (thread === null ? new ThreadMember(client, member, data.id, data.guild_id, member.user_id) : upsertThreadMember(thread, member, member.user_id)));
    if (thread !== null) {
        thread.memberCount = data.member_count;
        for (const id of removedIds) removeThreadMember(thread, id);
    }
    client.emit('threadMembersUpdate', data.id, data.guild_id, added, removedIds, thread);
};
