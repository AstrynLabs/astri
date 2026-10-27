import type { AutoModerationActionTypes, AutoModerationKeywordPresetTypes, AutoModerationTriggerTypes } from '../constants';

/** Settings for a rule's trigger. Fields that do not apply to the trigger type are empty. */
export interface AutoModerationTriggerMetadata {
    /** Keyword and member profile rules. */
    keywordFilter: string[];
    /** Keyword and member profile rules: Rust flavored regular expressions. */
    regexPatterns: string[];
    /** Keyword preset rules. */
    presets: AutoModerationKeywordPresetTypes[];
    /** Matches that never trigger the rule. */
    allowList: string[];
    /** Mention spam rules: unique role and user mentions allowed per message, or `null`. */
    mentionTotalLimit: number | null;
    /** Mention spam rules. */
    mentionRaidProtectionEnabled: boolean;
}

export interface AutoModerationAction {
    type: AutoModerationActionTypes;
    /** Alert actions only: where the alert is sent. */
    channelId: string | null;
    /** Timeout actions only. */
    durationSeconds: number | null;
    /** Block actions only: shown to the member instead of the default explanation. */
    customMessage: string | null;
}

/** A rule triggered and one of its actions ran. */
export interface AutoModerationActionExecution {
    guildId: string;
    action: AutoModerationAction;
    ruleId: string;
    ruleTriggerType: AutoModerationTriggerTypes;
    userId: string;
    channelId: string | null;
    /** `null` when the message was blocked, or the content was not a message. */
    messageId: string | null;
    /** The alert sent by an alert action, if one was sent. */
    alertSystemMessageId: string | null;
    /** Empty without the message content intent. */
    content: string;
    matchedKeyword: string | null;
    /** Empty without the message content intent. */
    matchedContent: string | null;
}
