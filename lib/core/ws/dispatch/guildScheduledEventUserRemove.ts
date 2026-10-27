import type { DispatchHandler } from '../../../types';

export const guildScheduledEventUserRemove: DispatchHandler<'GUILD_SCHEDULED_EVENT_USER_REMOVE'> = (client, data) => {
    const event = client.guilds.get(data.guild_id)?.scheduledEvents.get(data.guild_scheduled_event_id) ?? null;
    if (event !== null && event.userCount !== null) event.userCount = Math.max(0, event.userCount - 1);
    client.emit('guildScheduledEventUserRemove', data.guild_scheduled_event_id, data.user_id, data.guild_id, event);
};
