import type { DispatchHandler } from '../../../types';
import { GuildScheduledEvent } from '../../structures';

export const guildScheduledEventDelete: DispatchHandler<'GUILD_SCHEDULED_EVENT_DELETE'> = (client, data) => {
    const events = client.guilds.get(data.guild_id)?.scheduledEvents;
    const event = events?.get(data.id);
    events?.delete(data.id);
    event?.patch(data);
    client.emit('guildScheduledEventDelete', event ?? new GuildScheduledEvent(client, data));
};
