import type { ChannelTypes } from '../../../constants';
import type { APIChannel, APIInvite, APIWebhook, ChannelPermissionEditData, ClientContext, InviteCreateData, WebhookCreateData } from '../../../types';
import type { Guild } from '../guild';
import { upsertInvite, type Invite } from '../invite';
import type { Member } from '../member';
import { Permission } from '../permission';
import { PermissionOverwrite } from '../permissionOverwrite';
import { computeChannelPermissions } from '../util';
import { Webhook } from '../webhook';
import { Channel } from './channel';

/** Any channel that belongs to a guild. */
export abstract class GuildChannel extends Channel {
    readonly guildId: string;
    name: string;
    position = 0;
    permissionOverwrites: PermissionOverwrite[] = [];
    /** Category id. */
    parentId: string | null = null;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data);
        this.guildId = guildId;
    }

    /** The guild this channel belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    override patch(data: Partial<APIChannel>): void {
        super.patch(data);
        if (typeof data.name === 'string') this.name = data.name;
        if (data.position !== undefined) this.position = data.position;
        if (data.permission_overwrites !== undefined) this.permissionOverwrites = data.permission_overwrites.map((overwrite) => new PermissionOverwrite(overwrite));
        if (data.parent_id !== undefined) this.parentId = data.parent_id;
    }

    /**
     * A member's permissions in this channel, from their roles and the channel's overwrites.
     *
     * @throws When the guild, or the member given by id, is not cached.
     */
    permissionsOf(member: Member | string): Permission {
        return new Permission(computeChannelPermissions(this, member));
    }

    /** Creates or replaces the permission overwrite for a role or member. Needs the manage roles permission. */
    async editPermission(overwriteId: string, data: ChannelPermissionEditData, reason?: string): Promise<void> {
        await this.client.rest.put('channelPermission', this.id, overwriteId, data, reason);
    }

    /** Needs the manage roles permission. */
    async deletePermission(overwriteId: string, reason?: string): Promise<void> {
        await this.client.rest.delete('channelPermission', this.id, overwriteId, reason);
    }

    /** Needs the create instant invite permission. Not available on categories. */
    async createInvite(data: InviteCreateData = {}, reason?: string): Promise<Invite> {
        return upsertInvite(this.client, (await this.client.rest.post('channelInvites', this.id, data, reason)) as APIInvite);
    }

    /** Needs the manage channels permission. */
    async fetchInvites(): Promise<Invite[]> {
        const invites = await this.client.rest.get('channelInvites', this.id);
        return (invites as APIInvite[]).map((invite) => upsertInvite(this.client, invite));
    }

    /** Needs the manage webhooks permission. Not available on categories. */
    async createWebhook(data: WebhookCreateData, reason?: string): Promise<Webhook> {
        return new Webhook(this.client, (await this.client.rest.post('channelWebhooks', this.id, data, reason)) as APIWebhook);
    }

    /** Needs the manage webhooks permission. */
    async fetchWebhooks(): Promise<Webhook[]> {
        const webhooks = await this.client.rest.get('channelWebhooks', this.id);
        return (webhooks as APIWebhook[]).map((webhook) => new Webhook(this.client, webhook));
    }
}

export class CategoryChannel extends GuildChannel {
    declare readonly type: typeof ChannelTypes.GuildCategory;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}

/** The channel in a hub guild that lists the hub's member servers. */
export class DirectoryChannel extends GuildChannel {
    declare readonly type: typeof ChannelTypes.GuildDirectory;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}
