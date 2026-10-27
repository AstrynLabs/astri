import type { APIGuildTemplate, APIGuildTemplateSnapshot, APIUser, ClientContext, TemplateEditData } from '../../types';
import type { Guild } from './guild';
import { upsertUser, type User } from './user';

/**
 * A snapshot of a guild's settings, roles and channels that new guilds can be created from. Templates are keyed by
 * `code` rather than a snowflake, so unlike other structures they have no `id`.
 */
export class GuildTemplate {
    readonly client: ClientContext;
    readonly code: string;
    readonly sourceGuildId: string;
    readonly creatorId: string;
    name: string;
    description: string | null = null;
    usageCount = 0;
    creator: User | null = null;
    /** Unix ms. */
    createdAt: number;
    /** Unix ms of the last sync or edit. */
    updatedAt: number;
    /** The source guild as it was at the last sync, in the raw API shape. */
    serializedSourceGuild: APIGuildTemplateSnapshot;
    /** Whether the source guild changed since the last sync. `null` if not known. */
    isDirty: boolean | null = null;

    constructor(client: ClientContext, data: APIGuildTemplate) {
        this.client = client;
        this.code = data.code;
        this.sourceGuildId = data.source_guild_id;
        this.creatorId = data.creator_id;
        this.patch(data);
    }

    /** The source guild, if cached. */
    get sourceGuild(): Guild | undefined {
        return this.client.guilds.get(this.sourceGuildId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIGuildTemplate>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.description !== undefined) this.description = data.description;
        if (data.usage_count !== undefined) this.usageCount = data.usage_count;
        if (data.creator !== undefined) this.creator = data.creator === null ? null : upsertUser(this.client, data.creator as APIUser);
        if (data.created_at !== undefined) this.createdAt = Date.parse(data.created_at);
        if (data.updated_at !== undefined) this.updatedAt = Date.parse(data.updated_at);
        if (data.serialized_source_guild !== undefined) this.serializedSourceGuild = data.serialized_source_guild;
        if (data.is_dirty !== undefined) this.isDirty = data.is_dirty;
    }

    /** Updates the snapshot to the source guild's current state. Needs the manage guild permission. */
    async sync(): Promise<this> {
        this.patch(await this.client.rest.put('guildTemplate', this.sourceGuildId, this.code));
        return this;
    }

    /** Needs the manage guild permission. */
    async edit(data: TemplateEditData): Promise<this> {
        this.patch(await this.client.rest.patch('guildTemplate', this.sourceGuildId, this.code, data));
        return this;
    }

    /** Needs the manage guild permission. */
    async delete(): Promise<void> {
        await this.client.rest.delete('guildTemplate', this.sourceGuildId, this.code);
    }
}
