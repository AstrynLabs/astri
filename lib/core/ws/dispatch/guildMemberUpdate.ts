import type { DispatchHandler } from '../../../types';
import { Member } from '../../structures';

export const guildMemberUpdate: DispatchHandler<'GUILD_MEMBER_UPDATE'> = (client, data) => {
    const members = client.guilds.get(data.guild_id)?.members;
    const member = members?.get(data.user.id);
    if (member === undefined) {
        const created = new Member(client, data, data.guild_id);
        members?.set(created.id, created);
        client.emit('guildMemberUpdate', created, null);
        return;
    }

    const old = member.clone();
    member.patch(data);
    client.emit('guildMemberUpdate', member, old);
};
