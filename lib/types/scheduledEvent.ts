import type { RESTBody } from './rest';

/** Changes to a scheduled event. Fields left out are kept. */
export type GuildScheduledEventEditData = RESTBody<'/guilds/{guild_id}/scheduled-events/{guild_scheduled_event_id}', 'patch'>;
