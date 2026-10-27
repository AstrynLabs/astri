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
