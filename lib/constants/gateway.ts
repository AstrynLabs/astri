/** Gateway API version the library speaks. */
export const GATEWAY_VERSION = 10;

/** Default gateway endpoint, used until Discord hands out a session-specific resume URL. */
export const DEFAULT_GATEWAY_URL = 'wss://gateway.discord.gg';

/** Length in ms of the window in which up to `max_concurrency` shards may identify. */
export const IDENTIFY_WINDOW = 5_000;

/** Gateway payload opcodes. */
export const GatewayOpcodes = {
    Dispatch: 0,
    Heartbeat: 1,
    Identify: 2,
    PresenceUpdate: 3,
    VoiceStateUpdate: 4,
    Resume: 6,
    Reconnect: 7,
    RequestGuildMembers: 8,
    InvalidSession: 9,
    Hello: 10,
    HeartbeatAck: 11,
    RequestSoundboardSounds: 31
} as const;
export type GatewayOpcodes = (typeof GatewayOpcodes)[keyof typeof GatewayOpcodes];

/** Close codes Discord sends when it ends a gateway connection. */
export const GatewayCloseCodes = {
    UnknownError: 4000,
    UnknownOpcode: 4001,
    DecodeError: 4002,
    NotAuthenticated: 4003,
    AuthenticationFailed: 4004,
    AlreadyAuthenticated: 4005,
    InvalidSeq: 4007,
    RateLimited: 4008,
    SessionTimedOut: 4009,
    InvalidShard: 4010,
    ShardingRequired: 4011,
    InvalidAPIVersion: 4012,
    InvalidIntents: 4013,
    DisallowedIntents: 4014
} as const;
export type GatewayCloseCodes = (typeof GatewayCloseCodes)[keyof typeof GatewayCloseCodes];

/** Gateway intent bits. Combine with `|` for `ShardOptions.intents`. */
export const GatewayIntents = {
    Guilds: 1 << 0,
    GuildMembers: 1 << 1,
    GuildModeration: 1 << 2,
    GuildExpressions: 1 << 3,
    GuildIntegrations: 1 << 4,
    GuildWebhooks: 1 << 5,
    GuildInvites: 1 << 6,
    GuildVoiceStates: 1 << 7,
    GuildPresences: 1 << 8,
    GuildMessages: 1 << 9,
    GuildMessageReactions: 1 << 10,
    GuildMessageTyping: 1 << 11,
    DirectMessages: 1 << 12,
    DirectMessageReactions: 1 << 13,
    DirectMessageTyping: 1 << 14,
    MessageContent: 1 << 15,
    GuildScheduledEvents: 1 << 16,
    AutoModerationConfiguration: 1 << 20,
    AutoModerationExecution: 1 << 21,
    GuildMessagePolls: 1 << 24,
    DirectMessagePolls: 1 << 25
} as const;
export type GatewayIntents = (typeof GatewayIntents)[keyof typeof GatewayIntents];
