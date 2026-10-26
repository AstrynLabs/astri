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
