import type { RESTBody, RESTQuery } from './rest';

/** Changes to a scheduled event. Fields left out are kept. */
export type GuildScheduledEventEditData = RESTBody<'/guilds/{guild_id}/scheduled-events/{guild_scheduled_event_id}', 'patch'>;

/** `with_user_count` fills in each event's subscriber count. */
export type GuildScheduledEventFetchOptions = RESTQuery<'/guilds/{guild_id}/scheduled-events', 'get'>;

/** Which subscribers to fetch, in user id order. `with_member` also returns each one's guild member; `limit` is 1-100, 100 by default. */
export type GuildScheduledEventUserFetchOptions = RESTQuery<'/guilds/{guild_id}/scheduled-events/{guild_scheduled_event_id}/users', 'get'>;
