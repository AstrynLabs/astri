import type { DispatchHandler } from '../../../types';
import { getTextChannel } from '../../structures/util';

export const messageDelete: DispatchHandler<'MESSAGE_DELETE'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const messages = getTextChannel(client, data.channel_id, guildId)?.messages;
    const message = messages?.get(data.id) ?? null;
    messages?.delete(data.id);
    client.emit('messageDelete', data.id, data.channel_id, guildId, message);
};
