import type { DispatchHandler } from '../../../types';
import { Collection } from '../../cache';
import { getTextChannel } from '../../structures/util';

export const messageReactionRemoveAll: DispatchHandler<'MESSAGE_REACTION_REMOVE_ALL'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const message = getTextChannel(client, data.channel_id, guildId)?.messages.get(data.message_id) ?? null;
    const removed = message === null ? [] : message.reactions.toArray();
    if (message !== null) message.reactions = new Collection();
    client.emit('messageReactionRemoveAll', data.message_id, data.channel_id, guildId, message, removed);
};
