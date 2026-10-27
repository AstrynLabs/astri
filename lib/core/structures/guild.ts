import type { BulkBanResult, GuildAuditLog, GuildBan, GuildOnboarding, GuildVanityURL, GuildWidget, GuildWidgetSettings, VoiceRegion, WelcomeScreen } from '../../interfaces';
import type { APIAutoModerationRule, APIChannel, APIGuildAuditLog, APIGuildBan, APIGuildEmoji, APIGuildPreview, APIGuildScheduledEvent, APIGuildTemplate, APIIntegration, APISoundboardSound, APISticker, APIVoiceState, AuditLogFetchOptions, APIGuildMember, APIInvite, APIRole, APIWebhook, BanFetchOptions, BanOptions, BulkBanData, ClientContext, EmojiCreateData, GatewayGuildCreateData, GuildChannelCreateData, GuildEditData, GuildScheduledEventFetchOptions, MemberFetchOptions, PruneCountOptions, PruneOptions, RoleCreateData, SoundboardSoundCreateData, TemplateCreateData } from '../../types';
import type { Cache } from '../cache';
import { upsertAutoModerationRule, type AutoModerationRule } from './autoModerationRule';
import { Base } from './base';
import { createChannel, createThreadChannel, upsertGuildChannel, type Channel, type ThreadChannel } from './channels';
import { Emoji, upsertEmoji } from './emoji';
import { GuildIntegration } from './guildIntegration';
import { GuildPreview } from './guildPreview';
import { GuildTemplate } from './guildTemplate';
import { upsertInvite, type Invite } from './invite';
import { Member, upsertMember } from './member';
import { Presence } from './presence';
import { Role, upsertRole } from './role';
import { GuildScheduledEvent, upsertScheduledEvent } from './scheduledEvent';
import { SoundboardSound, upsertSoundboardSound } from './soundboardSound';
import { StageInstance } from './stageInstance';
import { Sticker, upsertSticker } from './sticker';
import { toGuildAuditLog, toGuildBan, toOnboarding, toThreadList, toVanityURL, toVoiceRegion, toWelcomeScreen, toWidget, toWidgetSettings } from './util';
import { upsertVoiceState, VoiceState } from './voiceState';
import { Webhook } from './webhook';

export class Guild extends Base {
    name: string;
    icon: string | null;
    splash: string | null;
    discoverySplash: string | null;
    banner: string | null;
    description: string | null;
    ownerId: string;
    afkChannelId: string | null;
    /** Seconds. */
    afkTimeout: number;
    verificationLevel: number;
    defaultMessageNotifications: number;
    explicitContentFilter: number;
    mfaLevel: number;
    nsfwLevel: number;
    premiumTier: number;
    premiumSubscriptionCount = 0;
    premiumProgressBarEnabled: boolean;
    features: string[];
    systemChannelId: string | null;
    systemChannelFlags: number;
    rulesChannelId: string | null;
    publicUpdatesChannelId: string | null;
    vanityURLCode: string | null;
    preferredLocale: string;
    maxMembers: number | null = null;
    /** Unix ms the client joined. Only known once the guild arrived through `GUILD_CREATE`. */
    joinedAt: number | null = null;
    /** Over the identify `largeThreshold`, so offline members are not sent up front. */
    large = false;
    /** Kept current by member add and remove events. */
    memberCount = 0;
    readonly roles: Cache<string, Role>;
    readonly emojis: Cache<string, Emoji>;
    readonly channels: Cache<string, Channel>;
    /** Active threads, plus archived ones seen since they were cached. */
    readonly threads: Cache<string, ThreadChannel>;
    /** Cached members. Usually a subset: large guilds only send online members up front. */
    readonly members: Cache<string, Member>;
    readonly stickers: Cache<string, Sticker>;
    /** Keyed by code. Filled by invite events and fetches, since guilds arrive without their invites. */
    readonly invites: Cache<string, Invite>;
    /** Everyone connected to a voice or stage channel, keyed by user id. */
    readonly voiceStates: Cache<string, VoiceState>;
    /** Keyed by user id. Needs the guild presences intent; large guilds only send online members up front. */
    readonly presences: Cache<string, Presence>;
    readonly scheduledEvents: Cache<string, GuildScheduledEvent>;
    /** Filled by rule events and fetches, since guilds arrive without their rules. */
    readonly autoModerationRules: Cache<string, AutoModerationRule>;
    /** Live stages, keyed by stage instance id. */
    readonly stageInstances: Cache<string, StageInstance>;
    /** Keyed by sound id. Kept current by soundboard events, which need the guild expressions intent. */
    readonly soundboardSounds: Cache<string, SoundboardSound>;

    constructor(client: ClientContext, data: Partial<GatewayGuildCreateData> & { id: string }) {
        super(client, data.id);
        this.roles = client.cache.create('roles');
        this.emojis = client.cache.create('emojis');
        this.channels = client.cache.create('channels');
        this.threads = client.cache.create('threads');
        this.members = client.cache.create('members');
        this.stickers = client.cache.create('stickers');
        this.invites = client.cache.create('invites');
        this.voiceStates = client.cache.create('voiceStates');
        this.presences = client.cache.create('presences');
        this.scheduledEvents = client.cache.create('scheduledEvents');
        this.autoModerationRules = client.cache.create('autoModerationRules');
        this.stageInstances = client.cache.create('stageInstances');
        this.soundboardSounds = client.cache.create('soundboardSounds');
        this.patch(data);
    }

    /**
     * Applies a payload. Fields missing from `data` keep their current value.
     *
     * `roles`, `emojis`, `stickers`, `channels`, `threads`, `voice_states`, `stage_instances`,
     * `guild_scheduled_events` and `soundboard_sounds` are taken as the complete list: entries not in it are dropped. A channel or thread
     * whose type changed is replaced with a new instance of the matching class. `members` and `presences` are only
     * ever partial lists, so they add and update without dropping anyone.
     */
    patch(data: Partial<GatewayGuildCreateData>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.icon !== undefined) this.icon = data.icon;
        if (data.splash !== undefined) this.splash = data.splash;
        if (data.discovery_splash !== undefined) this.discoverySplash = data.discovery_splash;
        if (data.banner !== undefined) this.banner = data.banner;
        if (data.description !== undefined) this.description = data.description;
        if (data.owner_id !== undefined) this.ownerId = data.owner_id;
        if (data.afk_channel_id !== undefined) this.afkChannelId = data.afk_channel_id;
        if (data.afk_timeout !== undefined) this.afkTimeout = data.afk_timeout;
        if (data.verification_level !== undefined) this.verificationLevel = data.verification_level;
        if (data.default_message_notifications !== undefined) this.defaultMessageNotifications = data.default_message_notifications;
        if (data.explicit_content_filter !== undefined) this.explicitContentFilter = data.explicit_content_filter;
        if (data.mfa_level !== undefined) this.mfaLevel = data.mfa_level;
        if (data.nsfw_level !== undefined) this.nsfwLevel = data.nsfw_level;
        if (data.premium_tier !== undefined) this.premiumTier = data.premium_tier;
        if (data.premium_subscription_count !== undefined) this.premiumSubscriptionCount = data.premium_subscription_count;
        if (data.premium_progress_bar_enabled !== undefined) this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
        if (data.features !== undefined) this.features = data.features;
        if (data.system_channel_id !== undefined) this.systemChannelId = data.system_channel_id;
        if (data.system_channel_flags !== undefined) this.systemChannelFlags = data.system_channel_flags;
        if (data.rules_channel_id !== undefined) this.rulesChannelId = data.rules_channel_id;
        if (data.public_updates_channel_id !== undefined) this.publicUpdatesChannelId = data.public_updates_channel_id;
        if (data.vanity_url_code !== undefined) this.vanityURLCode = data.vanity_url_code;
        if (data.preferred_locale !== undefined) this.preferredLocale = data.preferred_locale;
        if (data.max_members !== undefined) this.maxMembers = data.max_members;
        if (data.joined_at !== undefined) this.joinedAt = Date.parse(data.joined_at);
        if (data.large !== undefined) this.large = data.large;
        if (data.member_count !== undefined) this.memberCount = data.member_count;
        if (data.roles !== undefined) replaceAll(this.roles, data.roles, (role) => new Role(this.client, role, this.id));
        if (data.emojis !== undefined) replaceAll(this.emojis, data.emojis, (emoji) => new Emoji(this.client, emoji, this.id));
        if (data.channels !== undefined)
            replaceAll(
                this.channels,
                data.channels,
                (channel) => createChannel(this.client, channel, this.id),
                (cached, channel) => cached.type === channel.type
            );
        if (data.threads !== undefined)
            replaceAll(
                this.threads,
                data.threads,
                (thread) => createThreadChannel(this.client, thread, this.id),
                (cached, thread) => cached.type === thread.type
            );
        if (data.stickers !== undefined) replaceAll(this.stickers, data.stickers, (sticker) => new Sticker(this.client, { ...sticker, guild_id: this.id }));
        if (data.stage_instances !== undefined) replaceAll(this.stageInstances, data.stage_instances, (stageInstance) => new StageInstance(this.client, stageInstance));
        if (data.guild_scheduled_events !== undefined) replaceAll(this.scheduledEvents, data.guild_scheduled_events, (event) => new GuildScheduledEvent(this.client, event));
        if (data.soundboard_sounds !== undefined)
            replaceAll(
                this.soundboardSounds,
                data.soundboard_sounds.map((sound) => ({ ...sound, id: sound.sound_id, guild_id: this.id })),
                (sound) => new SoundboardSound(this.client, sound)
            );
        if (data.voice_states !== undefined) {
            const ids = new Set<string>();
            for (const voiceState of data.voice_states) {
                ids.add(voiceState.user_id);
                const cached = this.voiceStates.peek(voiceState.user_id);
                if (cached !== undefined) cached.patch(voiceState);
                else this.voiceStates.set(voiceState.user_id, new VoiceState(this.client, voiceState, this.id));
            }
            this.voiceStates.sweep((_value, id) => !ids.has(id));
        }
        if (data.presences !== undefined) {
            for (const presence of data.presences) {
                const cached = this.presences.peek(presence.user.id);
                if (cached !== undefined) cached.patch(presence);
                else if (presence.status !== 'offline') this.presences.set(presence.user.id, new Presence(this.client, presence, this.id));
            }
        }
        if (data.members !== undefined) {
            for (const member of data.members) {
                const cached = this.members.peek(member.user.id);
                if (cached !== undefined) cached.patch(member);
                else this.members.set(member.user.id, new Member(this.client, member, this.id));
            }
        }
    }

    /** Needs the manage guild permission. */
    async edit(data: GuildEditData, reason?: string): Promise<this> {
        this.patch((await this.client.rest.patch('guild', this.id, data, reason)) as Partial<GatewayGuildCreateData>);
        return this;
    }

    /** Makes the client leave the guild. The owner cannot leave. */
    async leave(): Promise<void> {
        await this.client.rest.delete('currentUserGuild', this.id);
    }

    /** Needs the manage channels permission. */
    async createChannel(data: GuildChannelCreateData, reason?: string): Promise<Channel> {
        return upsertGuildChannel(this.client, (await this.client.rest.post('guildChannels', this.id, data, reason)) as APIChannel, this.id);
    }

    /** Needs the manage roles permission. */
    async createRole(data: RoleCreateData = {}, reason?: string): Promise<Role> {
        return upsertRole(this.client, (await this.client.rest.post('guildRole', this.id, data, reason)) as APIRole, this.id);
    }

    /** Needs the create expressions permission. */
    async createEmoji(data: EmojiCreateData, reason?: string): Promise<Emoji> {
        return upsertEmoji(this.client, (await this.client.rest.post('guildEmoji', this.id, data, reason)) as APIGuildEmoji, this.id);
    }

    /** Fetches one member and caches it. */
    async fetchMember(userId: string): Promise<Member> {
        return upsertMember(this.client, (await this.client.rest.get('guildMember', this.id, userId)) as APIGuildMember, this.id);
    }

    /** Fetches up to 1000 members in user id order and caches them. Needs the guild members intent. */
    async fetchMembers(options?: MemberFetchOptions): Promise<Member[]> {
        const members = await this.client.rest.get('guildMembers', this.id, options);
        return (members as APIGuildMember[]).map((member) => upsertMember(this.client, member, this.id));
    }

    /** Fetches up to `limit` (1-1000, 1 by default) members whose username or nickname starts with `query`, and caches them. */
    async searchMembers(query: string, limit?: number): Promise<Member[]> {
        const members = await this.client.rest.get('guildMembersSearch', this.id, { query, limit });
        return (members as APIGuildMember[]).map((member) => upsertMember(this.client, member, this.id));
    }

    /** Bans a user, member or not. Needs the ban members permission. */
    async ban(userId: string, options: BanOptions = {}, reason?: string): Promise<void> {
        await this.client.rest.put('guildBan', this.id, userId, options, reason);
    }

    /** Bans up to 200 users at once. Needs the ban members and manage guild permissions. */
    async bulkBan(data: BulkBanData, reason?: string): Promise<BulkBanResult> {
        const result = await this.client.rest.post('guildBulkBan', this.id, data, reason);
        return { bannedUsers: result.banned_users, failedUsers: result.failed_users };
    }

    /** Needs the ban members permission. */
    async unban(userId: string, reason?: string): Promise<void> {
        await this.client.rest.delete('guildBan', this.id, userId, {}, reason);
    }

    /** Needs the ban members permission. */
    async fetchBan(userId: string): Promise<GuildBan> {
        return toGuildBan(this.client, (await this.client.rest.get('guildBan', this.id, userId)) as APIGuildBan);
    }

    /** Fetches up to 1000 bans in user id order. Needs the ban members permission. */
    async fetchBans(options?: BanFetchOptions): Promise<GuildBan[]> {
        const bans = await this.client.rest.get('guildBans', this.id, options);
        return ((bans ?? []) as APIGuildBan[]).map((ban) => toGuildBan(this.client, ban));
    }

    /** How many members a prune with the same options would kick. Needs the manage guild and kick members permissions. */
    async fetchPruneCount(options?: PruneCountOptions): Promise<number> {
        const result = await this.client.rest.get('guildPrune', this.id, options);
        return result.pruned ?? 0;
    }

    /**
     * Kicks inactive members. Needs the manage guild and kick members permissions. Resolves to how many were kicked, or
     * `null` with `compute_prune_count: false`, which large guilds should pass.
     */
    async prune(options: PruneOptions = {}, reason?: string): Promise<number | null> {
        return (await this.client.rest.post('guildPrune', this.id, options, reason)).pruned;
    }

    /** Needs the manage guild permission. */
    async fetchInvites(): Promise<Invite[]> {
        const invites = await this.client.rest.get('guildInvites', this.id);
        return (invites as APIInvite[]).map((invite) => upsertInvite(this.client, invite));
    }

    /** Needs the manage webhooks permission. */
    async fetchWebhooks(): Promise<Webhook[]> {
        const webhooks = await this.client.rest.get('guildWebhooks', this.id);
        return (webhooks as APIWebhook[]).map((webhook) => new Webhook(this.client, webhook));
    }

    /** Fetches a page of the audit log, newest first, with the users, threads and other objects it refers to. Needs the view audit log permission. */
    async fetchAuditLog(options?: AuditLogFetchOptions): Promise<GuildAuditLog> {
        return toGuildAuditLog(this.client, (await this.client.rest.get('guildAuditLogs', this.id, options)) as APIGuildAuditLog, this.id);
    }

    /** Needs the manage guild permission. */
    async fetchIntegrations(): Promise<GuildIntegration[]> {
        const integrations = await this.client.rest.get('guildIntegrations', this.id);
        return (integrations as APIIntegration[]).map((integration) => new GuildIntegration(this.client, integration, this.id));
    }

    /** Fetches the guild's public preview, with approximate member and presence counts. */
    async fetchPreview(): Promise<GuildPreview> {
        return new GuildPreview(this.client, (await this.client.rest.get('guildPreview', this.id)) as APIGuildPreview);
    }

    /** Needs the manage guild permission. */
    async fetchTemplates(): Promise<GuildTemplate[]> {
        const templates = await this.client.rest.get('guildTemplates', this.id);
        return (templates as APIGuildTemplate[]).map((template) => new GuildTemplate(this.client, template));
    }

    /** Needs the manage guild permission. */
    async createTemplate(data: TemplateCreateData): Promise<GuildTemplate> {
        return new GuildTemplate(this.client, (await this.client.rest.post('guildTemplate', this.id, data)) as APIGuildTemplate);
    }

    /** Fetches every soundboard sound and caches them. Needs the guild expressions intent or the manage expressions permission. */
    async fetchSoundboardSounds(): Promise<SoundboardSound[]> {
        const { items } = await this.client.rest.get('guildSoundboardSounds', this.id);
        return (items as APISoundboardSound[]).map((sound) => upsertSoundboardSound(this.client, sound, this.id));
    }

    /** Needs the create expressions permission. */
    async createSoundboardSound(data: SoundboardSoundCreateData, reason?: string): Promise<SoundboardSound> {
        return upsertSoundboardSound(this.client, (await this.client.rest.post('guildSoundboardSound', this.id, data, reason)) as APISoundboardSound, this.id);
    }

    /** Fetches one soundboard sound and caches it. */
    async fetchSoundboardSound(soundId: string): Promise<SoundboardSound> {
        return upsertSoundboardSound(this.client, (await this.client.rest.get('guildSoundboardSound', this.id, soundId)) as APISoundboardSound, this.id);
    }

    /** Fetches every channel, without threads, and caches them. */
    async fetchChannels(): Promise<Channel[]> {
        const channels = await this.client.rest.get('guildChannels', this.id);
        return ((channels ?? []) as APIChannel[]).map((channel) => upsertGuildChannel(this.client, channel, this.id));
    }

    /** Fetches every active thread the client can see and caches them, with the client's membership in each it joined. */
    async fetchActiveThreads(): Promise<ThreadChannel[]> {
        return toThreadList(this.client, await this.client.rest.get('guildThreadsActive', this.id), this.id).threads;
    }

    /** Fetches every role and caches them. */
    async fetchRoles(): Promise<Role[]> {
        const roles = await this.client.rest.get('guildRoles', this.id);
        return (roles as APIRole[]).map((role) => upsertRole(this.client, role, this.id));
    }

    /** Fetches one role and caches it. */
    async fetchRole(roleId: string): Promise<Role> {
        return upsertRole(this.client, (await this.client.rest.get('guildRole', this.id, roleId)) as APIRole, this.id);
    }

    /** How many members hold each role, by role id. `@everyone` is left out. */
    async fetchRoleMemberCounts(): Promise<Record<string, number>> {
        return this.client.rest.get('guildRolesMemberCounts', this.id);
    }

    /** Fetches every custom emoji and caches them. Uploaders are only included with the manage expressions permission. */
    async fetchEmojis(): Promise<Emoji[]> {
        const emojis = await this.client.rest.get('guildEmojis', this.id);
        return ((emojis ?? []) as APIGuildEmoji[]).map((emoji) => upsertEmoji(this.client, emoji, this.id));
    }

    /** Fetches one custom emoji and caches it. */
    async fetchEmoji(emojiId: string): Promise<Emoji> {
        return upsertEmoji(this.client, (await this.client.rest.get('guildEmoji', this.id, emojiId)) as APIGuildEmoji, this.id);
    }

    /** Fetches every sticker and caches them. Uploaders are only included with the manage expressions permission. */
    async fetchStickers(): Promise<Sticker[]> {
        const stickers = await this.client.rest.get('guildStickers', this.id);
        return (stickers as APISticker[]).map((sticker) => upsertSticker(this.client, { ...sticker, guild_id: this.id }));
    }

    /** Fetches one sticker and caches it. */
    async fetchSticker(stickerId: string): Promise<Sticker> {
        const sticker = (await this.client.rest.get('guildSticker', this.id, stickerId)) as APISticker;
        return upsertSticker(this.client, { ...sticker, guild_id: this.id });
    }

    /** Fetches every auto moderation rule and caches them. Needs the manage guild permission. */
    async fetchAutoModerationRules(): Promise<AutoModerationRule[]> {
        const rules = await this.client.rest.get('guildAutoModerationRules', this.id);
        return (rules ?? []).filter((rule) => rule !== null).map((rule) => upsertAutoModerationRule(this.client, rule as unknown as APIAutoModerationRule));
    }

    /** Fetches one auto moderation rule and caches it. Needs the manage guild permission. */
    async fetchAutoModerationRule(ruleId: string): Promise<AutoModerationRule> {
        return upsertAutoModerationRule(this.client, (await this.client.rest.get('guildAutoModerationRule', this.id, ruleId)) as unknown as APIAutoModerationRule);
    }

    /** Fetches every scheduled event and caches them. */
    async fetchScheduledEvents(options?: GuildScheduledEventFetchOptions): Promise<GuildScheduledEvent[]> {
        const events = await this.client.rest.get('guildScheduledEvents', this.id, options);
        return ((events ?? []) as unknown as APIGuildScheduledEvent[]).map((event) => upsertScheduledEvent(this.client, event));
    }

    /** Fetches one scheduled event and caches it. */
    async fetchScheduledEvent(eventId: string, options?: GuildScheduledEventFetchOptions): Promise<GuildScheduledEvent> {
        return upsertScheduledEvent(this.client, (await this.client.rest.get('guildScheduledEvent', this.id, eventId, options)) as unknown as APIGuildScheduledEvent);
    }

    /** Fetches a user's voice state, the client's own by default, and caches it. Fails when the user is not in voice. */
    async fetchVoiceState(userId?: string): Promise<VoiceState> {
        const state = userId === undefined ? await this.client.rest.get('guildCurrentVoiceState', this.id) : await this.client.rest.get('guildVoiceState', this.id, userId);
        return upsertVoiceState(this.client, state as APIVoiceState, this.id);
    }

    /** Voice regions available to the guild's channels, with VIP regions for VIP guilds. */
    async fetchVoiceRegions(): Promise<VoiceRegion[]> {
        return ((await this.client.rest.get('guildRegions', this.id)) ?? []).map(toVoiceRegion);
    }

    /** Needs the manage guild permission. */
    async fetchVanityURL(): Promise<GuildVanityURL> {
        return toVanityURL(await this.client.rest.get('guildVanityUrl', this.id));
    }

    /** Needs the manage guild permission, unless the welcome screen is enabled. */
    async fetchWelcomeScreen(): Promise<WelcomeScreen> {
        return toWelcomeScreen(await this.client.rest.get('guildWelcomeScreen', this.id));
    }

    /** Needs the manage guild permission. */
    async fetchWidgetSettings(): Promise<GuildWidgetSettings> {
        return toWidgetSettings(await this.client.rest.get('guildWidget', this.id));
    }

    /** Fetches the public widget. Fails when the widget is disabled. */
    async fetchWidget(): Promise<GuildWidget> {
        return toWidget(await this.client.rest.get('guildWidgetJson', this.id));
    }

    async fetchOnboarding(): Promise<GuildOnboarding> {
        return toOnboarding(await this.client.rest.get('guildOnboarding', this.id));
    }
}

function replaceAll<V extends { patch(data: D): void }, D extends { id: string }>(cache: Cache<string, V>, items: D[], create: (data: D) => V, reuse: (cached: V, data: D) => boolean = () => true): void {
    const ids = new Set<string>();
    for (const item of items) {
        ids.add(item.id);
        const cached = cache.peek(item.id);
        if (cached !== undefined && reuse(cached, item)) cached.patch(item);
        else cache.set(item.id, create(item));
    }
    cache.sweep((_value, id) => !ids.has(id));
}
