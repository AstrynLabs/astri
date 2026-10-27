import type { DispatchHandler } from '../../../types';

export const inviteDelete: DispatchHandler<'INVITE_DELETE'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const invites = guildId === null ? undefined : client.guilds.get(guildId)?.invites;
    const invite = invites?.get(data.code) ?? null;
    invites?.delete(data.code);
    client.emit('inviteDelete', data.code, data.channel_id, guildId, invite);
};
