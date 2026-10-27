import type { IntegrationExpireBehaviors } from '../../constants';
import type { IntegrationApplication } from '../../interfaces';
import type { APIIntegration, ClientContext } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import { upsertUser, type User } from './user';
import { parseTimestamp, toIntegrationApplication } from './util';

/** A Twitch or YouTube connection, a guild subscription, or a bot or webhook added to a guild. */
export class GuildIntegration extends Base {
    readonly guildId: string;
    readonly type: APIIntegration['type'];
    name: string | null;
    /** Always `true` for integrations read from an audit log, which leaves it out. */
    enabled = true;
    accountId: string;
    accountName: string | null;
    /** Who added the integration, if known. */
    user: User | null = null;
    /** Twitch and YouTube only. */
    syncing = false;
    /** Twitch and YouTube only: the role given to subscribers. */
    roleId: string | null = null;
    /** Twitch only. */
    enableEmoticons = false;
    /** Twitch and YouTube only. */
    expireBehavior: IntegrationExpireBehaviors | null = null;
    /** Twitch and YouTube only: days before an expired subscriber is acted on. */
    expireGracePeriod: number | null = null;
    /** Twitch and YouTube only: Unix ms of the last sync. */
    syncedAt: number | null = null;
    /** Twitch and YouTube only. */
    subscriberCount: number | null = null;
    /** Twitch and YouTube only: whether the connection was revoked. */
    revoked = false;
    /** `discord` only: the bot application behind it. */
    application: IntegrationApplication | null = null;
    /** `discord` only: the OAuth2 scopes the application was authorized with. */
    scopes: string[] = [];

    constructor(client: ClientContext, data: APIIntegration, guildId: string) {
        super(client, data.id);
        this.guildId = guildId;
        this.type = data.type;
        this.patch(data);
    }

    /** The guild this integration belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIIntegration>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.account !== undefined) {
            this.accountId = data.account.id;
            this.accountName = data.account.name;
        }
        if (data.user !== undefined) this.user = upsertUser(this.client, data.user);
        if (data.syncing !== undefined) this.syncing = data.syncing;
        if (data.role_id !== undefined) this.roleId = data.role_id;
        if (data.enable_emoticons !== undefined) this.enableEmoticons = data.enable_emoticons;
        if (data.expire_behavior !== undefined) this.expireBehavior = data.expire_behavior;
        if (data.expire_grace_period !== undefined) this.expireGracePeriod = data.expire_grace_period;
        if (data.synced_at !== undefined) this.syncedAt = parseTimestamp(data.synced_at);
        if (data.subscriber_count !== undefined) this.subscriberCount = data.subscriber_count;
        if (data.revoked !== undefined) this.revoked = data.revoked;
        if (data.application !== undefined) this.application = toIntegrationApplication(this.client, data.application);
        if (data.scopes !== undefined) this.scopes = data.scopes;
    }

    /** Removes the integration, kicking its bot and deleting its webhooks. Needs the manage guild permission. */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete('guildIntegration', this.guildId, this.id, reason);
    }
}
