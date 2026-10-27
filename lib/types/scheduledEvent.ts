import type { RESTBody, RESTQuery } from './rest';

/** Changes to a scheduled event. Fields left out are kept. */
export type GuildScheduledEventEditData = RESTBody<'/guilds/{guild_id}/scheduled-events/{guild_scheduled_event_id}', 'patch'>;

/** `with_user_count` fills in each event's subscriber count. */
export type GuildScheduledEventFetchOptions = RESTQuery<'/guilds/{guild_id}/scheduled-events', 'get'>;

/** Which subscribers to fetch, in user id order. `with_member` also returns each one's guild member; `limit` is 1-100, 100 by default. */
export type GuildScheduledEventUserFetchOptions = RESTQuery<'/guilds/{guild_id}/scheduled-events/{guild_scheduled_event_id}/users', 'get'>;

/** A new scheduled event. Stage and voice events need `channel_id`; external events need `entity_metadata.location` and `scheduled_end_time`. */
export type GuildScheduledEventCreateData = RESTBody<'/guilds/{guild_id}/scheduled-events', 'post'>;

/** A change to one occurrence of a recurring event, picked by its `original_scheduled_start_time`. */
export type GuildScheduledEventExceptionCreateData = RESTBody<'/guilds/{guild_id}/scheduled-events/{guild_scheduled_event_id}/exceptions', 'post'>;

/** Changes to an occurrence exception. Fields left out are kept. */
export type GuildScheduledEventExceptionEditData = RESTBody<'/guilds/{guild_id}/scheduled-events/{guild_scheduled_event_id}/exceptions/{exception_id}', 'patch'>;
