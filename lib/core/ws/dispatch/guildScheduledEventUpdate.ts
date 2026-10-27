import type { DispatchHandler } from '../../../types';
import { upsertScheduledEvent } from '../../structures';

export const guildScheduledEventUpdate: DispatchHandler<'GUILD_SCHEDULED_EVENT_UPDATE'> = (client, data) => {
    const old = client.guilds.get(data.guild_id)?.scheduledEvents.get(data.id)?.clone() ?? null;
    client.emit('guildScheduledEventUpdate', upsertScheduledEvent(client, data), old);
};
