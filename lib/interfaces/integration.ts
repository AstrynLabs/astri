import type { IntegrationExpireBehaviors } from '../constants';
import type { User } from '../core/structures';

export interface IntegrationApplication {
    id: string;
    name: string;
    icon: string | null;
    description: string;
    bot: User | null;
}

/** A Twitch or YouTube connection, a guild subscription, or a bot or webhook added to a guild. */
export interface Integration {
    id: string;
    guildId: string;
    name: string | null;
    type: 'twitch' | 'youtube' | 'discord' | 'guild_subscription';
    enabled: boolean;
    accountId: string;
    accountName: string | null;
    /** Who added the integration, if known. */
    user: User | null;
    /** Twitch and YouTube only. */
    syncing: boolean;
    /** Twitch and YouTube only: the role given to subscribers. */
    roleId: string | null;
    /** Twitch only. */
    enableEmoticons: boolean;
    /** Twitch and YouTube only. */
    expireBehavior: IntegrationExpireBehaviors | null;
    /** Twitch and YouTube only: days before an expired subscriber is acted on. */
    expireGracePeriod: number | null;
    /** Twitch and YouTube only: Unix ms of the last sync. */
    syncedAt: number | null;
    /** Twitch and YouTube only. */
    subscriberCount: number | null;
    /** Twitch and YouTube only: whether the connection was revoked. */
    revoked: boolean;
    /** `discord` only. */
    application: IntegrationApplication | null;
    /** `discord` only: the OAuth2 scopes the application was authorized with. */
    scopes: string[];
}
