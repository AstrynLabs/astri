import type { GuildScheduledEventPrivacyLevels, GuildScheduledEventStatuses } from '../../constants';
import type { components } from './openapi';
import type { APIUser } from './user';

export type APIRecurrenceRule = components['schemas']['RecurrenceRuleResponse'];

export interface APIGuildScheduledEvent {
    id: string;
    guild_id: string;
    /** `null` for external events. */
    channel_id: string | null;
    /** `null` for events created before 2021-10-25. */
    creator_id?: string | null;
    name: string;
    description?: string | null;
    /** ISO 8601 timestamp. */
    scheduled_start_time: string;
    /** ISO 8601 timestamp. Always set for external events. */
    scheduled_end_time: string | null;
    privacy_level: GuildScheduledEventPrivacyLevels;
    status: GuildScheduledEventStatuses;
    /** One of {@link GuildScheduledEventEntityTypes}. */
    entity_type: number;
    entity_id: string | null;
    /** External events only: where it takes place. */
    entity_metadata?: { location?: string } | null;
    creator?: APIUser;
    /** Users subscribed to the event. Only sent when requested. */
    user_count?: number;
    /** Cover image hash. */
    image?: string | null;
    recurrence_rule: APIRecurrenceRule | null;
}

export type APIGuildScheduledEventUser = components['schemas']['ScheduledEventUserResponse'];
export type APIGuildScheduledEventUserCounts = components['schemas']['ScheduledEventUserCountResponse'];
export type APIGuildScheduledEventException = components['schemas']['GuildScheduledEventExceptionResponse'];
