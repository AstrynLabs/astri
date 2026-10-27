import type { AutoModerationActionTypes, AutoModerationEventTypes, AutoModerationKeywordPresetTypes, AutoModerationTriggerTypes } from '../../constants';

/** Settings for a rule's trigger. Which fields are present depends on the trigger type. */
export interface APIAutoModerationTriggerMetadata {
    /** Keyword and member profile rules. */
    keyword_filter?: string[];
    /** Keyword and member profile rules: Rust flavored regular expressions. */
    regex_patterns?: string[];
    /** Keyword preset rules. */
    presets?: AutoModerationKeywordPresetTypes[];
    /** Keyword, keyword preset and member profile rules: matches that never trigger the rule. */
    allow_list?: string[];
    /** Mention spam rules: unique role and user mentions allowed per message. */
    mention_total_limit?: number;
    mention_raid_protection_enabled?: boolean;
}

export interface APIAutoModerationAction {
    type: AutoModerationActionTypes;
    metadata?: {
        /** Alert actions only. */
        channel_id?: string;
        /** Timeout actions only. Up to 4 weeks. */
        duration_seconds?: number;
        /** Block actions only: shown to the member instead of the default explanation. */
        custom_message?: string;
    };
}

export interface APIAutoModerationRule {
    id: string;
    guild_id: string;
    name: string;
    creator_id: string;
    event_type: AutoModerationEventTypes;
    trigger_type: AutoModerationTriggerTypes;
    trigger_metadata: APIAutoModerationTriggerMetadata;
    actions: APIAutoModerationAction[];
    enabled: boolean;
    exempt_roles: string[];
    exempt_channels: string[];
}
