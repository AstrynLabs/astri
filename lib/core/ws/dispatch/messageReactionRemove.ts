import type { DispatchHandler } from '../../../types';
import { applyReactionRemove, getTextChannel, toReactionEmoji } from '../../structures/util';

export const messageReactionRemove: DispatchHandler<'MESSAGE_REACTION_REMOVE'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const message = getTextChannel(client, data.channel_id, guildId)?.messages.get(data.message_id) ?? null;
    if (message !== null) applyReactionRemove(message, data.emoji, data.burst, data.user_id === client.user?.id);
    client.emit('messageReactionRemove', { messageId: data.message_id, channelId: data.channel_id, guildId, userId: data.user_id, emoji: toReactionEmoji(data.emoji), burst: data.burst }, message);
};
