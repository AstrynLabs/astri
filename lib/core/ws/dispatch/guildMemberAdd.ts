import type { DispatchHandler } from '../../../types';
import { Member } from '../../structures';

export const guildMemberAdd: DispatchHandler<'GUILD_MEMBER_ADD'> = (client, data) => {
    const member = new Member(client, data, data.guild_id);
    const guild = client.guilds.get(data.guild_id);
    if (guild !== undefined) {
        guild.members.set(member.id, member);
        guild.memberCount++;
    }
    client.emit('guildMemberAdd', member);
};
