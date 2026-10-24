import type { DispatchHandler } from '../../../types';
import { parseTimestamp } from '../../structures/util';

export const channelPinsUpdate: DispatchHandler<'CHANNEL_PINS_UPDATE'> = (client, data) => {
    const guildId = data.guild_id ?? null;
    const guild = guildId === null ? undefined : client.guilds.get(guildId);
    const channel = guild?.channels.get(data.channel_id) ?? guild?.threads.get(data.channel_id) ?? null;
    const lastPinTimestamp = data.last_pin_timestamp ?? null;
    channel?.patch({ last_pin_timestamp: lastPinTimestamp });
    client.emit('channelPinsUpdate', data.channel_id, guildId, parseTimestamp(lastPinTimestamp), channel);
};
