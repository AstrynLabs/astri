import type { ClientContext, GatewayGuildCreateData } from '../../types';
import type { Cache } from '../cache';
import { Base } from './base';
import { Emoji } from './emoji';
import { Member } from './member';
import { Role } from './role';

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
    /** Cached members. Usually a subset: large guilds only send online members up front. */
    readonly members: Cache<string, Member>;

    constructor(client: ClientContext, data: Partial<GatewayGuildCreateData> & { id: string }) {
        super(client, data.id);
        this.roles = client.cache.create('roles');
        this.emojis = client.cache.create('emojis');
        this.members = client.cache.create('members');
        this.patch(data);
    }

    /**
     * Applies a payload. Fields missing from `data` keep their current value.
     *
     * `roles` and `emojis` are taken as the complete list: entries not in it are dropped. `members` is only
     * ever a partial list, so it adds and updates without dropping anyone.
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
        if (data.members !== undefined) {
            for (const member of data.members) {
                const cached = this.members.peek(member.user.id);
                if (cached !== undefined) cached.patch(member);
                else this.members.set(member.user.id, new Member(this.client, member, this.id));
            }
        }
    }
}

function replaceAll<V extends { patch(data: D): void }, D extends { id: string }>(cache: Cache<string, V>, items: D[], create: (data: D) => V): void {
    const ids = new Set<string>();
    for (const item of items) {
        ids.add(item.id);
        const cached = cache.peek(item.id);
        if (cached !== undefined) cached.patch(item);
        else cache.set(item.id, create(item));
    }
    cache.sweep((_value, id) => !ids.has(id));
}
