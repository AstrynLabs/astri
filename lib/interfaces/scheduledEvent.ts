import type { GuildScheduledEventUserResponses } from '../constants';
import type { Member, User } from '../core/structures';

/** A weekday within a given week of the month, such as the second Tuesday. */
export interface RecurrenceRuleNWeekday {
    /** `1` to `5`, where `5` is the last week. */
    n: number;
    /** `0` Monday to `6` Sunday. */
    day: number;
}

/** How a scheduled event repeats. */
export interface RecurrenceRule {
    /** Unix ms the recurrence starts. */
    start: number;
    /** Unix ms the recurrence ends, or `null` if it does not. */
    end: number | null;
    /** `0` yearly, `1` monthly, `2` weekly, `3` daily. */
    frequency: number;
    /** Spacing between occurrences, in units of `frequency`. */
    interval: number;
    /** `0` Monday to `6` Sunday. */
    byWeekday: number[] | null;
    byNWeekday: RecurrenceRuleNWeekday[] | null;
    /** `1` January to `12` December. */
    byMonth: number[] | null;
    byMonthDay: number[] | null;
    byYearDay: number[] | null;
    /** How many times the event may occur, or `null` for no limit. */
    count: number | null;
}

/** A user's answer to a scheduled event, or to one occurrence of a recurring event. */
export interface GuildScheduledEventUser {
    eventId: string;
    /** The occurrence answered for, or `null` for the whole event. */
    exceptionId: string | null;
    userId: string;
    user: User | null;
    /** Only sent when requested, and only for users who are still members. */
    member: Member | null;
    response: GuildScheduledEventUserResponses;
}

export interface GuildScheduledEventUserCounts {
    /** Users subscribed to the event. */
    total: number;
    /** Users subscribed to each requested occurrence, by exception id. */
    exceptions: Record<string, number>;
}
