import type { DispatchHandler } from '../../../types';
import { ThreadMember, upsertThreadMember } from '../../structures';

export const threadMemberUpdate: DispatchHandler<'THREAD_MEMBER_UPDATE'> = (client, data) => {
    const thread = client.guilds.get(data.guild_id)?.threads.get(data.id) ?? null;
    const member = thread === null ? new ThreadMember(client, data, data.id, data.guild_id, data.user_id) : upsertThreadMember(thread, data, data.user_id);
    client.emit('threadMemberUpdate', member, thread);
};
