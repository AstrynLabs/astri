import type { APIGuildEmoji } from './emoji';
import type { components } from './openapi';
import type { APIRole } from './role';
import type { APISticker } from './sticker';
import type { APIUser } from './user';

export interface APIGuild {
    id: string;
    name: string;
    icon: string | null;
    splash: string | null;
    discovery_splash: string | null;
    banner: string | null;
    description: string | null;
    owner_id: string;
    afk_channel_id: string | null;
    afk_timeout: number;
    verification_level: number;
    default_message_notifications: number;
    explicit_content_filter: number;
    mfa_level: number;
    nsfw_level: number;
    premium_tier: number;
    premium_subscription_count?: number;
    premium_progress_bar_enabled: boolean;
    features: string[];
    roles: APIRole[];
    emojis: APIGuildEmoji[];
    stickers?: APISticker[];
    system_channel_id: string | null;
    system_channel_flags: number;
    rules_channel_id: string | null;
    public_updates_channel_id: string | null;
    vanity_url_code: string | null;
    preferred_locale: string;
    max_members?: number;
}

export interface APIGuildBan {
    user: APIUser;
    reason: string | null;
}

/** A guild the client is in but cannot see, either during startup or because of an outage. */
export interface APIUnavailableGuild {
    id: string;
    unavailable: true;
}

/** A guild as listed for the client's own user, with its permissions in it. */
export type APIUserGuild = components['schemas']['MyGuildResponse'];
export type APIGuildVanityURL = components['schemas']['VanityURLResponse'];
export type APIGuildWelcomeScreen = components['schemas']['GuildWelcomeScreenResponse'];
export type APIGuildWidgetSettings = components['schemas']['WidgetSettingsResponse'];
export type APIGuildWidget = components['schemas']['WidgetResponse'];
export type APIGuildOnboarding = components['schemas']['UserGuildOnboardingResponse'];
export type APIGuildIncidentsData = components['schemas']['GuildIncidentsDataResponse'];
export type APIGuildSearchResult = components['schemas']['GuildSearchResponse'];
