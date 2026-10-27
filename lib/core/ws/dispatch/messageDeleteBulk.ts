import type { DispatchHandler } from '../../../types';
import { type Message } from '../../structures';
import { getTextChannel } from '../../structures/util';

export const messageDeleteBulk: DispatchHandler<'MESSAGE_DELETE_BULK'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const messages = getTextChannel(client, data.channel_id, guildId)?.messages;
    const deleted: Message[] = [];
    if (messages !== undefined) {
        for (const id of data.ids) {
            const message = messages.get(id);
            if (message === undefined) continue;
            deleted.push(message);
            messages.delete(id);
        }
    }
    client.emit('messageDeleteBulk', data.ids, data.channel_id, guildId, deleted);
};
