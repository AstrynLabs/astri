import type { GuildOnboardingModes, OnboardingPromptTypes } from '../constants';
import type { Member, Message, Permission, Presence, ThreadChannel, User } from '../core/structures';
import type { ReactionEmoji } from './message';

export interface GuildBan {
    user: User;
    /** What the moderator gave as the reason, if anything. */
    reason: string | null;
}

export interface BulkBanResult {
    bannedUsers: string[];
    /** Already banned, or could not be banned. */
    failedUsers: string[];
}

/** One `GUILD_MEMBERS_CHUNK`, sent in reply to a guild members request. */
export interface GuildMembersChunk {
    guildId: string;
    members: Member[];
    /** Empty unless the request asked for presences. */
    presences: Presence[];
    /** Requested user ids that are not members. */
    notFound: string[];
    chunkIndex: number;
    chunkCount: number;
    /** The request's nonce, or `null` if it had none. */
    nonce: string | null;
}

/** A guild members request waiting for its chunks. */
export interface PendingMemberRequest {
    members: Member[];
    /** Ms to wait for each chunk. */
    timeout: number;
    timer: ReturnType<typeof setTimeout>;
    resolve(members: Member[]): void;
    reject(error: Error): void;
}

/** A guild the client is in, as listed for its own user. */
export interface UserGuild {
    id: string;
    name: string;
    icon: string | null;
    banner: string | null;
    /** Whether the client owns the guild. */
    owner: boolean;
    /** The client's permissions across the guild. */
    permissions: Permission;
    features: string[];
    /** Only sent when requested. */
    approximateMemberCount: number | null;
    /** Only sent when requested. */
    approximatePresenceCount: number | null;
}

export interface GuildVanityURL {
    /** `null` when the guild has no vanity URL. */
    code: string | null;
    uses: number;
}

/** What new members see before they pick channels, in guilds with community enabled. */
export interface WelcomeScreen {
    description: string | null;
    /** Up to 5 suggested channels. */
    welcomeChannels: WelcomeScreenChannel[];
}

export interface WelcomeScreenChannel {
    channelId: string;
    description: string;
    emojiId: string | null;
    /** Unicode emoji, or the name of the custom emoji in `emojiId`. */
    emojiName: string | null;
}

export interface GuildWidgetSettings {
    enabled: boolean;
    /** The channel the widget's invite opens, or `null` for none. */
    channelId: string | null;
}

/** The public widget of a guild that enabled it. */
export interface GuildWidget {
    id: string;
    name: string;
    /** Invite URL to the widget's channel, or `null` without one. */
    instantInvite: string | null;
    /** Voice channels everyone can join, by position. */
    channels: GuildWidgetChannel[];
    /** Up to 100 online members. Ids and avatars are anonymized. */
    members: GuildWidgetMember[];
    /** Online members. */
    presenceCount: number;
}

export interface GuildWidgetChannel {
    id: string;
    name: string;
    position: number;
}

export interface GuildWidgetMember {
    /** An index within the widget, not the user's id. */
    id: string;
    username: string;
    status: string;
    avatarURL: string;
    /** What the member is playing, if anything. */
    activityName: string | null;
    /** The widget voice channel the member is in, if any. */
    channelId: string | null;
}

/** The questions and default channels new members go through when joining. */
export interface GuildOnboarding {
    guildId: string;
    prompts: OnboardingPrompt[];
    /** Channels members get opted into automatically. */
    defaultChannelIds: string[];
    enabled: boolean;
    mode: GuildOnboardingModes;
}

export interface OnboardingPrompt {
    id: string;
    type: OnboardingPromptTypes;
    title: string;
    options: OnboardingPromptOption[];
    /** Whether members pick only one option. */
    singleSelect: boolean;
    /** Whether members must answer before finishing onboarding. */
    required: boolean;
    /** Whether the prompt is shown during onboarding, rather than only in Channels & Roles. */
    inOnboarding: boolean;
}

export interface OnboardingPromptOption {
    id: string;
    title: string;
    description: string;
    emoji: ReactionEmoji | null;
    /** Roles given to members who pick the option. */
    roleIds: string[];
    /** Channels members who pick the option get opted into. */
    channelIds: string[];
}

/** Raid protections in effect. */
export interface GuildIncidentActions {
    /** Unix ms new invites are paused until, or `null`. */
    invitesDisabledUntil: number | null;
    /** Unix ms DMs between members who are not friends are paused until, or `null`. */
    dmsDisabledUntil: number | null;
}

/** A page of messages matching a guild search. */
export interface GuildMessageSearchResult {
    messages: Message[];
    /** Messages matching the search across every page. */
    totalResults: number;
    /** Threads the matching messages are in. */
    threads: ThreadChannel[];
    /** Whether Discord is still indexing older messages, so results may be missing some. */
    indexing: boolean;
}
