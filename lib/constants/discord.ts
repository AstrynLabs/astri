/** Discord's epoch (2015-01-01T00:00:00.000Z) in milliseconds. */
export const DISCORD_EPOCH = 1420070400000;

/** Values of a channel's `type`. */
export const ChannelTypes = {
    GuildText: 0,
    DM: 1,
    GuildVoice: 2,
    GroupDM: 3,
    GuildCategory: 4,
    GuildAnnouncement: 5,
    AnnouncementThread: 10,
    PublicThread: 11,
    PrivateThread: 12,
    GuildStageVoice: 13,
    GuildDirectory: 14,
    GuildForum: 15,
    GuildMedia: 16
} as const;
export type ChannelTypes = (typeof ChannelTypes)[keyof typeof ChannelTypes];

/** Values of an interaction's `type`. */
export const InteractionTypes = {
    Ping: 1,
    ApplicationCommand: 2,
    MessageComponent: 3,
    ApplicationCommandAutocomplete: 4,
    ModalSubmit: 5
} as const;
export type InteractionTypes = (typeof InteractionTypes)[keyof typeof InteractionTypes];

/** Values of an interaction response's `type`. */
export const InteractionCallbackTypes = {
    Pong: 1,
    ChannelMessageWithSource: 4,
    DeferredChannelMessageWithSource: 5,
    DeferredUpdateMessage: 6,
    UpdateMessage: 7,
    ApplicationCommandAutocompleteResult: 8,
    Modal: 9,
    LaunchActivity: 12
} as const;
export type InteractionCallbackTypes = (typeof InteractionCallbackTypes)[keyof typeof InteractionCallbackTypes];

/** Where an interaction was triggered from. */
export const InteractionContextTypes = {
    Guild: 0,
    BotDM: 1,
    PrivateChannel: 2
} as const;
export type InteractionContextTypes = (typeof InteractionContextTypes)[keyof typeof InteractionContextTypes];

/** Values of an application command's `type`. */
export const ApplicationCommandTypes = {
    ChatInput: 1,
    User: 2,
    Message: 3,
    PrimaryEntryPoint: 4
} as const;
export type ApplicationCommandTypes = (typeof ApplicationCommandTypes)[keyof typeof ApplicationCommandTypes];

/** Values of an application command option's `type`. */
export const ApplicationCommandOptionTypes = {
    Subcommand: 1,
    SubcommandGroup: 2,
    String: 3,
    Integer: 4,
    Boolean: 5,
    User: 6,
    Channel: 7,
    Role: 8,
    Mentionable: 9,
    Number: 10,
    Attachment: 11
} as const;
export type ApplicationCommandOptionTypes = (typeof ApplicationCommandOptionTypes)[keyof typeof ApplicationCommandOptionTypes];

/** Values of a message or modal component's `type`. */
export const ComponentTypes = {
    ActionRow: 1,
    Button: 2,
    StringSelect: 3,
    TextInput: 4,
    UserSelect: 5,
    RoleSelect: 6,
    MentionableSelect: 7,
    ChannelSelect: 8,
    Section: 9,
    TextDisplay: 10,
    Thumbnail: 11,
    MediaGallery: 12,
    File: 13,
    Separator: 14,
    Container: 17,
    Label: 18,
    FileUpload: 19
} as const;
export type ComponentTypes = (typeof ComponentTypes)[keyof typeof ComponentTypes];

/** Message flag bits. */
export const MessageFlags = {
    Crossposted: 1 << 0,
    IsCrosspost: 1 << 1,
    SuppressEmbeds: 1 << 2,
    SourceMessageDeleted: 1 << 3,
    Urgent: 1 << 4,
    HasThread: 1 << 5,
    /** Only the user who triggered the interaction can see the message. */
    Ephemeral: 1 << 6,
    Loading: 1 << 7,
    FailedToMentionSomeRolesInThread: 1 << 8,
    SuppressNotifications: 1 << 12,
    IsVoiceMessage: 1 << 13,
    HasSnapshot: 1 << 14,
    /** The message is laid out with components only; `content` and `embeds` cannot be set. */
    IsComponentsV2: 1 << 15
} as const;
export type MessageFlags = (typeof MessageFlags)[keyof typeof MessageFlags];

/** Values of a message's `type`. */
export const MessageTypes = {
    Default: 0,
    RecipientAdd: 1,
    RecipientRemove: 2,
    Call: 3,
    ChannelNameChange: 4,
    ChannelIconChange: 5,
    ChannelPinnedMessage: 6,
    UserJoin: 7,
    GuildBoost: 8,
    GuildBoostTier1: 9,
    GuildBoostTier2: 10,
    GuildBoostTier3: 11,
    ChannelFollowAdd: 12,
    GuildDiscoveryDisqualified: 14,
    GuildDiscoveryRequalified: 15,
    GuildDiscoveryGracePeriodInitialWarning: 16,
    GuildDiscoveryGracePeriodFinalWarning: 17,
    ThreadCreated: 18,
    Reply: 19,
    ChatInputCommand: 20,
    ThreadStarterMessage: 21,
    GuildInviteReminder: 22,
    ContextMenuCommand: 23,
    AutoModerationAction: 24,
    RoleSubscriptionPurchase: 25,
    InteractionPremiumUpsell: 26,
    StageStart: 27,
    StageEnd: 28,
    StageSpeaker: 29,
    StageTopic: 31,
    GuildApplicationPremiumSubscription: 32,
    GuildIncidentAlertModeEnabled: 36,
    GuildIncidentAlertModeDisabled: 37,
    GuildIncidentReportRaid: 38,
    GuildIncidentReportFalseAlarm: 39,
    PurchaseNotification: 44,
    PollResult: 46
} as const;
export type MessageTypes = (typeof MessageTypes)[keyof typeof MessageTypes];

/** Values of a message reference's `type`. */
export const MessageReferenceTypes = {
    /** A reply. */
    Default: 0,
    Forward: 1
} as const;
export type MessageReferenceTypes = (typeof MessageReferenceTypes)[keyof typeof MessageReferenceTypes];

/** Values of a reaction event's `type`. */
export const ReactionTypes = {
    Normal: 0,
    /** A super reaction. */
    Burst: 1
} as const;
export type ReactionTypes = (typeof ReactionTypes)[keyof typeof ReactionTypes];

/** Values of a sticker's `type`. */
export const StickerTypes = {
    /** Part of an official sticker pack. */
    Standard: 1,
    Guild: 2
} as const;
export type StickerTypes = (typeof StickerTypes)[keyof typeof StickerTypes];

/** Values of a sticker's `format_type`. */
export const StickerFormatTypes = {
    PNG: 1,
    APNG: 2,
    Lottie: 3,
    GIF: 4
} as const;
export type StickerFormatTypes = (typeof StickerFormatTypes)[keyof typeof StickerFormatTypes];

/** Values of an invite's `type`. */
export const InviteTypes = {
    Guild: 0,
    GroupDM: 1,
    Friend: 2
} as const;
export type InviteTypes = (typeof InviteTypes)[keyof typeof InviteTypes];

/** What a voice channel invite opens. */
export const InviteTargetTypes = {
    Stream: 1,
    EmbeddedApplication: 2,
    RoleSubscriptionsPurchase: 3
} as const;
export type InviteTargetTypes = (typeof InviteTargetTypes)[keyof typeof InviteTargetTypes];

/** Values of a webhook's `type`. */
export const WebhookTypes = {
    /** Posts messages with its token. */
    Incoming: 1,
    /** Crossposts an announcement channel's messages into another channel. */
    ChannelFollower: 2,
    /** Used with interactions. */
    Application: 3
} as const;
export type WebhookTypes = (typeof WebhookTypes)[keyof typeof WebhookTypes];

/** Values of an activity's `type`. */
export const ActivityTypes = {
    Playing: 0,
    Streaming: 1,
    Listening: 2,
    Watching: 3,
    Custom: 4,
    Competing: 5
} as const;
export type ActivityTypes = (typeof ActivityTypes)[keyof typeof ActivityTypes];

/** Values of a scheduled event's `status`. */
export const GuildScheduledEventStatuses = {
    Scheduled: 1,
    Active: 2,
    Completed: 3,
    Canceled: 4
} as const;
export type GuildScheduledEventStatuses = (typeof GuildScheduledEventStatuses)[keyof typeof GuildScheduledEventStatuses];

/** Where a scheduled event takes place. */
export const GuildScheduledEventEntityTypes = {
    StageInstance: 1,
    Voice: 2,
    External: 3
} as const;
export type GuildScheduledEventEntityTypes = (typeof GuildScheduledEventEntityTypes)[keyof typeof GuildScheduledEventEntityTypes];

/** Values of a scheduled event's `privacy_level`. */
export const GuildScheduledEventPrivacyLevels = {
    GuildOnly: 2
} as const;
export type GuildScheduledEventPrivacyLevels = (typeof GuildScheduledEventPrivacyLevels)[keyof typeof GuildScheduledEventPrivacyLevels];

/** What an auto moderation rule looks for. */
export const AutoModerationTriggerTypes = {
    Keyword: 1,
    Spam: 3,
    KeywordPreset: 4,
    MentionSpam: 5,
    MemberProfile: 6
} as const;
export type AutoModerationTriggerTypes = (typeof AutoModerationTriggerTypes)[keyof typeof AutoModerationTriggerTypes];

/** When an auto moderation rule is checked. */
export const AutoModerationEventTypes = {
    MessageSend: 1,
    MemberUpdate: 2
} as const;
export type AutoModerationEventTypes = (typeof AutoModerationEventTypes)[keyof typeof AutoModerationEventTypes];

/** What an auto moderation rule does when it triggers. */
export const AutoModerationActionTypes = {
    BlockMessage: 1,
    SendAlertMessage: 2,
    Timeout: 3,
    BlockMemberInteraction: 4
} as const;
export type AutoModerationActionTypes = (typeof AutoModerationActionTypes)[keyof typeof AutoModerationActionTypes];

/** Word lists Discord maintains for keyword preset rules. */
export const AutoModerationKeywordPresetTypes = {
    Profanity: 1,
    SexualContent: 2,
    Slurs: 3
} as const;
export type AutoModerationKeywordPresetTypes = (typeof AutoModerationKeywordPresetTypes)[keyof typeof AutoModerationKeywordPresetTypes];

/** Values of a stage instance's `privacy_level`. */
export const StageInstancePrivacyLevels = {
    /** Deprecated by Discord. */
    Public: 1,
    GuildOnly: 2
} as const;
export type StageInstancePrivacyLevels = (typeof StageInstancePrivacyLevels)[keyof typeof StageInstancePrivacyLevels];

/** Values of an entitlement's `type`. */
export const EntitlementTypes = {
    Purchase: 1,
    PremiumSubscription: 2,
    DeveloperGift: 3,
    TestModePurchase: 4,
    FreePurchase: 5,
    UserGift: 6,
    PremiumPurchase: 7,
    ApplicationSubscription: 8
} as const;
export type EntitlementTypes = (typeof EntitlementTypes)[keyof typeof EntitlementTypes];

/** What an application command permission applies to. */
export const ApplicationCommandPermissionTypes = {
    Role: 1,
    User: 2,
    Channel: 3
} as const;
export type ApplicationCommandPermissionTypes = (typeof ApplicationCommandPermissionTypes)[keyof typeof ApplicationCommandPermissionTypes];
