import type { DispatchHandler } from '../../../types';
import { upsertUser } from '../../structures';

export const guildMemberRemove: DispatchHandler<'GUILD_MEMBER_REMOVE'> = (client, data) => {
    const user = upsertUser(client, data.user);
    const guild = client.guilds.get(data.guild_id);
    const member = guild?.members.get(user.id) ?? null;
    if (guild !== undefined) {
        guild.members.delete(user.id);
        guild.memberCount = Math.max(0, guild.memberCount - 1);
    }
    client.emit('guildMemberRemove', user, data.guild_id, member);
};
