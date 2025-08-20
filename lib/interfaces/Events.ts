import { type GatewayReceivePayload, type GatewayActivity, type GatewayPresenceClientStatus, type PresenceUpdateReceiveStatus, type GatewayMessageUpdateDispatchData, type APIAttachment, type APIEmbed, type APIEmoji, type ChannelType, type VideoQualityMode, type APISticker, type ThreadMemberFlags, type APIStageInstance, type StageInstancePrivacyLevel } from 'discord-api-types/v10';
import type Member from '../structures/Member';
import type User from '../structures/User';
import { type ChannelTypes, type VoiceBasedChannel } from './Types';
import type PartialUser from '../structures/PartialUser';
import type Message from '../structures/Message';
import type MessageFlagBitfield from '../util/MessageFlagBitfield';
import type Guild from '../structures/Guild';
import type UnavailableGuild from '../structures/UnavailableGuild';
import type Role from '../structures/Role';
import type Invite from '../structures/Invite';
import type PermissionOverwrite from '../structures/PermissionOverwrite';
import type Collection from '../util/Collection';
import type ThreadChannel from '../structures/ThreadChannel';
import type ThreadMember from '../structures/ThreadMember';
import type PartialChannel from '../structures/PartialChannel';
import type StageInstance from '../structures/StageInstance';
import type Interaction from '../structures/Interaction';
import type GuildAuditLogEntry from '../structures/GuildAuditLogEntry';
import { type IncomingMessage } from 'http';
import { type FileType } from '../rest/RequestHandler';
import type Entitlement from '../structures/Entitlement';
import type { CommandErrorData } from '../errors/CommandError';
import Subscription from '../structures/Subscription';

export interface UncachedMessage {
  id: string;
  channel: ChannelTypes | { id: string; guild?: { id: string } };
  guildID?: string;
}

interface Events {
  ready: () => any;
  error: (error: Error | string, shard?: number) => any;
  disconnect: (error?: Error | null) => any;
  debug: (info: string, shard?: number) => any;
  warn: (info: string | Error, shard?: number) => any;
  rawWS: (packet: GatewayReceivePayload, shard: number) => any;
  unknown: (packet: any, shard: number) => any;
  userUpdate: (current: User, old: { username: string; discriminator: string; avatar: string | null } | null) => any;
  presenceUpdate: (member: Member, old: { activities: GatewayActivity[]; clientStatus: GatewayPresenceClientStatus; status: PresenceUpdateReceiveStatus | null } | null) => any;
  voiceStateUpdate: (current: { id: string; voiceState: { deaf?: boolean; mute?: boolean; selfDeaf?: boolean; selfMute?: boolean; selfStream?: boolean; selfVideo?: boolean } } | Member, old: { deaf?: boolean; mute?: boolean; selfDeaf?: boolean; selfMute?: boolean; selfStream?: boolean; selfVideo?: boolean } | null) => any;
  voiceChannelSwitch: (member: Member, current: VoiceBasedChannel, old: VoiceBasedChannel) => any;
  voiceChannelJoin: (member: Member, current: VoiceBasedChannel) => any;
  voiceChannelLeave: (member: Member, old: VoiceBasedChannel) => any;
  typingStart: (channel: ChannelTypes, user: User | PartialUser, member: Member | null) => any;
  messageCreate: (message: Message) => any;
  messageUpdate: (message: Message | GatewayMessageUpdateDispatchData, old: { attachments: APIAttachment[]; channelMentions: string[]; content: string; editedTimestamp: number | null; embeds: APIEmbed[]; flags: MessageFlagBitfield; mentions: User[]; pinned: boolean; roleMentions: string[]; tts: boolean } | null) => any;
  messageDelete: (message: Message | UncachedMessage) => any;
  messageDeleteBulk: (messages: Array<Message | UncachedMessage>) => any;
  messageReactionAdd: (message: Message | UncachedMessage, emoji: APIEmoji, member: Member | PartialUser) => any;
  messageReactionRemove: (message: Message | UncachedMessage, emoji: APIEmoji, user: string) => any;
  messageReactionRemoveAll: (message: Message | UncachedMessage) => any;
  messageReactionRemoveEmoji: (message: Message | UncachedMessage, emoji: APIEmoji) => any;
  guildMemberAdd: (guild: Guild, member: Member) => any;
  guildMemberUpdate: (guild: Guild, member: Member, old: { avatar: string | null; communicationDisabledUntil: number | null; roles: string[]; nick: string | null; premiumSince: number | null; pending: boolean | undefined } | null) => any;
  guildMemberRemove: (guild: Guild, member: Member | { id: string; user: User }) => any;
  guildAvailable: (guild: Guild) => any;
  guildCreate: (guild: Guild) => any;
  unavailableGuildCreate: (guild: UnavailableGuild) => any;
  guildUpdate: (
    guild: Guild,
    old: {
      afkChannelID: Guild['afkChannelID'];
      afkTimeout: Guild['afkTimeout'];
      banner: Guild['banner'];
      defaultNotifications: Guild['defaultNotifications'];
      description: Guild['description'];
      discoverySplash: Guild['discoverySplash'];
      emojis: Guild['emojis'];
      explicitContentFilter: Guild['explicitContentFilter'];
      features: Guild['features'];
      icon: Guild['icon'];
      large: Guild['large'];
      maxMembers: Guild['maxMembers'];
      maxVideoChannelUsers: Guild['maxVideoChannelUsers'];
      mfaLevel: Guild['mfaLevel'];
      name: Guild['name'];
      nsfwLevel: Guild['nsfwLevel'];
      ownerID: Guild['ownerID'];
      preferredLocale: Guild['preferredLocale'];
      premiumSubscriptionCount: Guild['premiumSubscriptionCount'];
      premiumTier: Guild['premiumTier'];
      publicUpdatesChannelID: Guild['publicUpdatesChannelID'];
      rulesChannelID: Guild['rulesChannelID'];
      splash: Guild['splash'];
      stickers: Guild['stickers'];
      systemChannelFlags: Guild['systemChannelFlags'];
      systemChannelID: Guild['systemChannelID'];
      vanityURL: Guild['vanityURL'];
      verificationLevel: Guild['verificationLevel'];
    }
  ) => any;
  guildUnavailable: (guild: UnavailableGuild) => any;
  guildDelete: (guild: Guild | { id: string }) => any;
  guildBanAdd: (guild: Guild, user: User) => any;
  guildBanRemove: (guild: Guild, user: User) => any;
  guildRoleCreate: (guild: Guild, role: Role) => any;
  guildRoleUpdate: (
    guild: Guild,
    role: Role,
    old: {
      color: Role['color'];
      hoist: Role['hoist'];
      icon: Role['icon'];
      managed: Role['managed'];
      mentionable: Role['mentionable'];
      name: Role['name'];
      permissions: Role['permissions'];
      position: Role['position'];
      tags: Role['tags'];
      unicodeEmoji: Role['unicodeEmoji'];
    }
  ) => any;
  guildRoleDelete: (guild: Guild, role: Role) => any;
  inviteCreate: (guild: Guild, invite: Invite) => any;
  inviteDelete: (guild: Guild, invite: Invite) => any;
  channelCreate: (channel: ChannelTypes) => any;
  channelUpdate: (
    channel: ChannelTypes,
    old?: {
      bitrate: number | null;
      name: string;
      nsfw?: boolean;
      parentID?: string | null;
      permissionOverwrites: Collection<PermissionOverwrite>;
      position: number | undefined;
      rateLimitPerUser: number | null;
      rtcRegion: string | null;
      topic?: string | null;
      type: ChannelType | null;
      userLimit?: number | null;
      videoQualityMode?: VideoQualityMode | null;
    }
  ) => any;
  channelDelete: (channel: ChannelTypes) => any;
  guildMemberChunk: (guild: Guild, members: Member[]) => any;
  resume: () => any;
  shardPreReady: (id: number) => any;
  guildEmojisUpdate: (guild: Guild | { id: string }, emojis: APIEmoji[], old: APIEmoji[] | null) => any;
  guildStickersUpdate: (guild: Guild | { id: string }, stickers: APISticker[], old: APISticker[] | null) => any;
  channelPinUpdate: (channel: ChannelTypes, currentTimestamp: number, old: number | null) => any;
  webhooksUpdate: (data: { channelID: string; guildID: string }) => any;
  threadCreate: (thread: ThreadChannel) => any;
  threadUpdate: (
    thread: ThreadChannel,
    old?: {
      name: string;
      rateLimitPerUser: number | null;
      threadMetadata:
        | {
            archiveTimestamp: number;
            archived: boolean;
            autoArchiveDuration: number;
            locked?: boolean | undefined;
            invitable?: boolean | undefined;
          }
        | undefined;
    } | null
  ) => any;
  threadDelete: (thread: ThreadChannel) => any;
  threadListSync: (guild: Guild, deleted: Array<ThreadChannel | PartialChannel>, active: ThreadChannel[], joined: ThreadMember[]) => any;
  threadMemberUpdate: (
    thread: ThreadChannel,
    member: ThreadMember,
    old: {
      flags: ThreadMemberFlags;
    } | null
  ) => any;
  threadMembersUpdate: (thread: ThreadChannel, added: ThreadMember[], removed: Array<ThreadMember | { id: string }>) => any;
  stageInstanceCreate: (stage: StageInstance) => any;
  stageInstanceUpdate: (
    stage: APIStageInstance,
    old: {
      privacyLevel: StageInstancePrivacyLevel | undefined;
      topic: string | undefined;
    } | null
  ) => any;
  stageInstanceDelete: (stage: StageInstance) => any;
  interactionCreate: (interaction: Interaction) => any;
  guildAuditLogEntryCreate: (entry: GuildAuditLogEntry) => any;
  connect: (id: number) => any;
  shardReady: (id: number) => any;
  shardResume: (id: number) => any;
  shardDisconnect: (error: Error | string | null | undefined, id: number) => any;
  rawREST: (data: { method: string; url: string; auth: boolean | undefined; body: any; file: FileType | undefined; route: any; short: boolean | undefined; resp: IncomingMessage; latency: number }) => any;
  hello: (trace: string[], shard: number) => any;
  commandError: (command: string, interaction: Interaction, data: CommandErrorData) => any;
  commandExecuted: (command: string, type: 'command' | 'autocomplete' | 'modal' | 'component', interaction: Interaction) => any;
  entitlementCreate: (entitlement: Entitlement) => any;
  entitlementUpdate: (entitlement: Entitlement) => any;
  entitlementDelete: (entitlement: Entitlement) => any;
  subscriptionCreate: (subscription: Subscription) => any;
  subscriptionUpdate: (subscription: Subscription) => any;
  subscriptionDelete: (subscription: Subscription) => any;
  event: (event: keyof Events, ...args: any[]) => any;
}

export default Events;
