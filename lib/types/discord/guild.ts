import type { APIGuildEmoji } from './emoji';
import type { APIRole } from './role';

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
    system_channel_id: string | null;
    system_channel_flags: number;
    rules_channel_id: string | null;
    public_updates_channel_id: string | null;
    vanity_url_code: string | null;
    preferred_locale: string;
    max_members?: number;
}

/** A guild the client is in but cannot see, either during startup or because of an outage. */
export interface APIUnavailableGuild {
    id: string;
    unavailable: true;
}
