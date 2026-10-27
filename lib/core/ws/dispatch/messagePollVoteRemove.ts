import type { DispatchHandler } from '../../../types';
import { applyPollVote, getTextChannel } from '../../structures/util';

export const messagePollVoteRemove: DispatchHandler<'MESSAGE_POLL_VOTE_REMOVE'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const message = getTextChannel(client, data.channel_id, guildId)?.messages.get(data.message_id) ?? null;
    if (message !== null) applyPollVote(message, data.answer_id, -1, data.user_id === client.user?.id);
    client.emit('messagePollVoteRemove', data.user_id, data.answer_id, data.message_id, data.channel_id, guildId, message);
};
