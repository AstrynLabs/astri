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

/** Channel types that are threads. */
export const THREAD_CHANNEL_TYPES: ReadonlySet<number> = new Set([ChannelTypes.AnnouncementThread, ChannelTypes.PublicThread, ChannelTypes.PrivateThread]);

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

/** Values of a subscription's `status`. */
export const SubscriptionStatuses = {
    Active: 0,
    /** Still active, but will not renew. */
    Ending: 1,
    Inactive: 2
} as const;
export type SubscriptionStatuses = (typeof SubscriptionStatuses)[keyof typeof SubscriptionStatuses];

/** What happens to a subscriber when their integration subscription expires. */
export const IntegrationExpireBehaviors = {
    RemoveRole: 0,
    Kick: 1
} as const;
export type IntegrationExpireBehaviors = (typeof IntegrationExpireBehaviors)[keyof typeof IntegrationExpireBehaviors];

/** How a voice channel emoji reaction is animated. */
export const VoiceChannelEffectAnimationTypes = {
    /** Fancy animation, only available to Nitro subscribers. */
    Premium: 0,
    Basic: 1
} as const;
export type VoiceChannelEffectAnimationTypes = (typeof VoiceChannelEffectAnimationTypes)[keyof typeof VoiceChannelEffectAnimationTypes];

/** Values of an audit log entry's `action_type`. */
export const AuditLogEvents = {
    GuildUpdate: 1,
    ChannelCreate: 10,
    ChannelUpdate: 11,
    ChannelDelete: 12,
    ChannelOverwriteCreate: 13,
    ChannelOverwriteUpdate: 14,
    ChannelOverwriteDelete: 15,
    MemberKick: 20,
    MemberPrune: 21,
    MemberBanAdd: 22,
    MemberBanRemove: 23,
    MemberUpdate: 24,
    MemberRoleUpdate: 25,
    MemberMove: 26,
    MemberDisconnect: 27,
    BotAdd: 28,
    RoleCreate: 30,
    RoleUpdate: 31,
    RoleDelete: 32,
    InviteCreate: 40,
    InviteUpdate: 41,
    InviteDelete: 42,
    WebhookCreate: 50,
    WebhookUpdate: 51,
    WebhookDelete: 52,
    EmojiCreate: 60,
    EmojiUpdate: 61,
    EmojiDelete: 62,
    MessageDelete: 72,
    MessageBulkDelete: 73,
    MessagePin: 74,
    MessageUnpin: 75,
    IntegrationCreate: 80,
    IntegrationUpdate: 81,
    IntegrationDelete: 82,
    StageInstanceCreate: 83,
    StageInstanceUpdate: 84,
    StageInstanceDelete: 85,
    StickerCreate: 90,
    StickerUpdate: 91,
    StickerDelete: 92,
    GuildScheduledEventCreate: 100,
    GuildScheduledEventUpdate: 101,
    GuildScheduledEventDelete: 102,
    ThreadCreate: 110,
    ThreadUpdate: 111,
    ThreadDelete: 112,
    ApplicationCommandPermissionUpdate: 121,
    SoundboardSoundCreate: 130,
    SoundboardSoundUpdate: 131,
    SoundboardSoundDelete: 132,
    AutoModerationRuleCreate: 140,
    AutoModerationRuleUpdate: 141,
    AutoModerationRuleDelete: 142,
    AutoModerationBlockMessage: 143,
    AutoModerationFlagToChannel: 144,
    AutoModerationUserCommunicationDisabled: 145,
    AutoModerationQuarantineUser: 146,
    CreatorMonetizationRequestCreated: 150,
    CreatorMonetizationTermsAccepted: 151,
    OnboardingPromptCreate: 163,
    OnboardingPromptUpdate: 164,
    OnboardingPromptDelete: 165,
    OnboardingCreate: 166,
    OnboardingUpdate: 167,
    HomeSettingsCreate: 190,
    HomeSettingsUpdate: 191
} as const;
export type AuditLogEvents = (typeof AuditLogEvents)[keyof typeof AuditLogEvents];

/** Permission bits. Combine with `|`. */
export const Permissions = {
    CreateInstantInvite: 1n << 0n,
    KickMembers: 1n << 1n,
    BanMembers: 1n << 2n,
    Administrator: 1n << 3n,
    ManageChannels: 1n << 4n,
    ManageGuild: 1n << 5n,
    AddReactions: 1n << 6n,
    ViewAuditLog: 1n << 7n,
    PrioritySpeaker: 1n << 8n,
    Stream: 1n << 9n,
    ViewChannel: 1n << 10n,
    SendMessages: 1n << 11n,
    SendTTSMessages: 1n << 12n,
    ManageMessages: 1n << 13n,
    EmbedLinks: 1n << 14n,
    AttachFiles: 1n << 15n,
    ReadMessageHistory: 1n << 16n,
    MentionEveryone: 1n << 17n,
    UseExternalEmojis: 1n << 18n,
    ViewGuildInsights: 1n << 19n,
    Connect: 1n << 20n,
    Speak: 1n << 21n,
    MuteMembers: 1n << 22n,
    DeafenMembers: 1n << 23n,
    MoveMembers: 1n << 24n,
    UseVAD: 1n << 25n,
    ChangeNickname: 1n << 26n,
    ManageNicknames: 1n << 27n,
    ManageRoles: 1n << 28n,
    ManageWebhooks: 1n << 29n,
    ManageGuildExpressions: 1n << 30n,
    UseApplicationCommands: 1n << 31n,
    RequestToSpeak: 1n << 32n,
    ManageEvents: 1n << 33n,
    ManageThreads: 1n << 34n,
    CreatePublicThreads: 1n << 35n,
    CreatePrivateThreads: 1n << 36n,
    UseExternalStickers: 1n << 37n,
    SendMessagesInThreads: 1n << 38n,
    UseEmbeddedActivities: 1n << 39n,
    ModerateMembers: 1n << 40n,
    ViewCreatorMonetizationAnalytics: 1n << 41n,
    UseSoundboard: 1n << 42n,
    CreateGuildExpressions: 1n << 43n,
    CreateEvents: 1n << 44n,
    UseExternalSounds: 1n << 45n,
    SendVoiceMessages: 1n << 46n,
    SetVoiceChannelStatus: 1n << 48n,
    SendPolls: 1n << 49n,
    UseExternalApps: 1n << 50n,
    PinMessages: 1n << 51n,
    BypassSlowmode: 1n << 52n
} as const;

/** Every permission bit. */
export const ALL_PERMISSIONS = Object.values(Permissions).reduce((all, bit) => all | bit, 0n);

/** What remains of a timed out member's permissions in a channel. */
export const TIMED_OUT_PERMISSIONS = Permissions.ViewChannel | Permissions.ReadMessageHistory;

/** What a permission overwrite applies to. */
export const OverwriteTypes = {
    Role: 0,
    Member: 1
} as const;
export type OverwriteTypes = (typeof OverwriteTypes)[keyof typeof OverwriteTypes];

/** Values of a guild onboarding's `mode`: which channels and prompts count towards the onboarding requirements. */
export const GuildOnboardingModes = {
    /** Only default channels count. */
    Default: 0,
    /** Default channels and questions count. */
    Advanced: 1
} as const;
export type GuildOnboardingModes = (typeof GuildOnboardingModes)[keyof typeof GuildOnboardingModes];

export const OnboardingPromptTypes = {
    MultipleChoice: 0,
    Dropdown: 1
} as const;
export type OnboardingPromptTypes = (typeof OnboardingPromptTypes)[keyof typeof OnboardingPromptTypes];

/** How a linked role's metadata value is compared against the guild's requirement. */
export const ApplicationRoleConnectionMetadataTypes = {
    IntegerLessThanOrEqual: 1,
    IntegerGreaterThanOrEqual: 2,
    IntegerEqual: 3,
    IntegerNotEqual: 4,
    DatetimeLessThanOrEqual: 5,
    DatetimeGreaterThanOrEqual: 6,
    BooleanEqual: 7,
    BooleanNotEqual: 8
} as const;
export type ApplicationRoleConnectionMetadataTypes = (typeof ApplicationRoleConnectionMetadataTypes)[keyof typeof ApplicationRoleConnectionMetadataTypes];

/** A user's answer to a scheduled event. */
export const GuildScheduledEventUserResponses = {
    Interested: 0,
    NotInterested: 1
} as const;
export type GuildScheduledEventUserResponses = (typeof GuildScheduledEventUserResponses)[keyof typeof GuildScheduledEventUserResponses];
