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
