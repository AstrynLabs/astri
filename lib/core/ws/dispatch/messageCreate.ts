import type { DispatchHandler } from '../../../types';
import { ThreadChannel, upsertMessage } from '../../structures';
import { getTextChannel } from '../../structures/util';

export const messageCreate: DispatchHandler<'MESSAGE_CREATE'> = (client, data) => {
    const message = upsertMessage(client, data);
    const channel = getTextChannel(client, data.channel_id, message.guildId);
    if (channel !== undefined) {
        channel.lastMessageId = message.id;
        if (channel instanceof ThreadChannel && message.id !== channel.id) {
            channel.messageCount++;
            channel.totalMessageSent++;
        }
    }
    client.emit('messageCreate', message);
};
