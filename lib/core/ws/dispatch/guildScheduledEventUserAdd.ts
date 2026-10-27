import type { DispatchHandler } from '../../../types';

export const guildScheduledEventUserAdd: DispatchHandler<'GUILD_SCHEDULED_EVENT_USER_ADD'> = (client, data) => {
    const event = client.guilds.get(data.guild_id)?.scheduledEvents.get(data.guild_scheduled_event_id) ?? null;
    if (event !== null && event.userCount !== null) event.userCount++;
    client.emit('guildScheduledEventUserAdd', data.guild_scheduled_event_id, data.user_id, data.guild_id, event);
};
