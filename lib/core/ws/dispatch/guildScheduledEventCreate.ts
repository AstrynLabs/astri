import type { DispatchHandler } from '../../../types';
import { upsertScheduledEvent } from '../../structures';

export const guildScheduledEventCreate: DispatchHandler<'GUILD_SCHEDULED_EVENT_CREATE'> = (client, data) => {
    client.emit('guildScheduledEventCreate', upsertScheduledEvent(client, data));
};
