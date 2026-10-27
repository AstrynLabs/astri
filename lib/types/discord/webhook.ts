import type { WebhookTypes } from '../../constants';
import type { APIUser } from './user';

/** Any webhook. Which optional fields are present depends on `type` and who fetched it. */
export interface APIWebhook {
    id: string;
    type: WebhookTypes;
    guild_id?: string | null;
    channel_id: string | null;
    /** Who created it. Left out when fetched with the webhook token. */
    user?: APIUser;
    name: string | null;
    avatar: string | null;
    /** Incoming webhooks only. Left out when the client did not create it and lacks the manage webhooks permission. */
    token?: string;
    /** The application that created it, for application and bot-made webhooks. */
    application_id: string | null;
    /** Channel follower webhooks only. */
    source_guild?: { id: string; name: string; icon: string | null };
    /** Channel follower webhooks only. */
    source_channel?: { id: string; name: string };
    /** Incoming webhooks created through OAuth2 only. */
    url?: string;
}
