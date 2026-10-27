import type { DispatchHandler } from '../../../types';
import { upsertMember } from '../../structures';
import { applyReactionAdd, getTextChannel, toReactionEmoji } from '../../structures/util';

export const messageReactionAdd: DispatchHandler<'MESSAGE_REACTION_ADD'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const message = getTextChannel(client, data.channel_id, guildId)?.messages.get(data.message_id) ?? null;
    const member = data.member === undefined || guildId === null ? null : upsertMember(client, data.member, guildId);
    const burstColors = data.burst_colors ?? [];
    if (message !== null) applyReactionAdd(message, data.emoji, data.burst, burstColors, data.user_id === client.user?.id);
    client.emit(
        'messageReactionAdd',
        {
            messageId: data.message_id,
            channelId: data.channel_id,
            guildId,
            userId: data.user_id,
            emoji: toReactionEmoji(data.emoji),
            burst: data.burst,
            messageAuthorId: data.message_author_id ?? null,
            burstColors
        },
        message,
        member
    );
};
