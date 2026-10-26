import type { DispatchHandler } from '../../../types';
import { upsertMessage } from '../../structures';
import { getTextChannel } from '../../structures/util';

export const messageUpdate: DispatchHandler<'MESSAGE_UPDATE'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const message = getTextChannel(client, data.channel_id, guildId)?.messages.get(data.id);
    if (message === undefined) {
        client.emit('messageUpdate', upsertMessage(client, data, guildId), null);
        return;
    }

    const old = message.clone();
    message.patch(data);
    client.emit('messageUpdate', message, old);
};
