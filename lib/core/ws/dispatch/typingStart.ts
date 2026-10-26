import type { DispatchHandler } from '../../../types';
import { upsertMember } from '../../structures';
import { getTextChannel } from '../../structures/util';

export const typingStart: DispatchHandler<'TYPING_START'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const member = data.member === undefined || guildId === null ? null : upsertMember(client, data.member, guildId);
    const channel = getTextChannel(client, data.channel_id, guildId) ?? null;
    client.emit('typingStart', data.user_id, data.channel_id, guildId, data.timestamp * 1000, member, channel);
};
