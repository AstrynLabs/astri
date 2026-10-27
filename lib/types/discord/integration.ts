import type { IntegrationExpireBehaviors } from '../../constants';
import type { APIUser } from './user';

export interface APIIntegrationAccount {
    id: string;
    name: string | null;
}

/** The bot application behind a `discord` integration. */
export interface APIIntegrationApplication {
    id: string;
    name: string;
    icon: string | null;
    description: string;
    bot?: APIUser;
}

/** A Twitch or YouTube connection, a guild subscription, or a bot or webhook added to a guild. Which fields are present depends on `type`. */
export interface APIIntegration {
    id: string;
    name: string | null;
    type: 'twitch' | 'youtube' | 'discord' | 'guild_subscription';
    enabled: boolean;
    account: APIIntegrationAccount;
    /** Twitch and YouTube only. */
    syncing?: boolean;
    /** Twitch and YouTube only: the role given to subscribers. */
    role_id?: string | null;
    /** Twitch only. */
    enable_emoticons?: boolean;
    /** Twitch and YouTube only. */
    expire_behavior?: IntegrationExpireBehaviors;
    /** Twitch and YouTube only: days before an expired subscriber is acted on. */
    expire_grace_period?: number;
    /** Who added the integration. */
    user?: APIUser;
    /** Twitch and YouTube only. ISO 8601 timestamp. */
    synced_at?: string;
    /** Twitch and YouTube only. */
    subscriber_count?: number;
    /** Twitch and YouTube only: whether the connection was revoked. */
    revoked?: boolean;
    /** `discord` only. */
    application?: APIIntegrationApplication;
    /** `discord` only: the OAuth2 scopes the application was authorized with. */
    scopes?: string[];
}
