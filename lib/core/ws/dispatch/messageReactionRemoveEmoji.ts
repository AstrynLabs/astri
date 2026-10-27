import type { DispatchHandler } from '../../../types';
import { getTextChannel, reactionKey, toReactionEmoji } from '../../structures/util';

export const messageReactionRemoveEmoji: DispatchHandler<'MESSAGE_REACTION_REMOVE_EMOJI'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const message = getTextChannel(client, data.channel_id, guildId)?.messages.get(data.message_id) ?? null;
    const key = reactionKey(data.emoji);
    const removed = message?.reactions.get(key) ?? null;
    message?.reactions.delete(key);
    client.emit('messageReactionRemoveEmoji', toReactionEmoji(data.emoji), data.message_id, data.channel_id, guildId, message, removed);
};
