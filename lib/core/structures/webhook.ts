import type { WebhookTypes } from '../../constants';
import type { WebhookSourceChannel, WebhookSourceGuild } from '../../interfaces';
import type { APIWebhook, ClientContext, WebhookEditData, WebhookMessageCreateData, WebhookMessageEditData, WebhookTokenEditData } from '../../types';
import { Base } from './base';
import type { Channel } from './channels';
import type { Guild } from './guild';
import { upsertMessage, type Message } from './message';
import { upsertUser, type User } from './user';
import { splitFiles } from './util';

/**
 * A webhook. Incoming webhooks post messages with their token; channel follower webhooks crosspost an
 * announcement channel; application webhooks back interactions. Webhooks are not cached, since no event carries them.
 */
export class Webhook extends Base {
    readonly type: WebhookTypes;
    /** `null` for application webhooks. */
    readonly guildId: string | null;
    channelId: string | null;
    name: string | null;
    /** Avatar hash. */
    avatar: string | null;
    /** Who created it. Not known when fetched with the webhook's token. */
    user: User | null = null;
    /** Needed to send messages. Only known for webhooks the client created or can manage. */
    token: string | null = null;
    /** The application that created it, for application and bot-made webhooks. */
    applicationId: string | null = null;
    /** Channel follower webhooks only. */
    sourceGuild: WebhookSourceGuild | null = null;
    /** Channel follower webhooks only. */
    sourceChannel: WebhookSourceChannel | null = null;

    constructor(client: ClientContext, data: APIWebhook) {
        super(client, data.id);
        this.type = data.type;
        this.guildId = data.guild_id ?? null;
        this.patch(data);
    }

    /** The guild the webhook is in, if cached. */
    get guild(): Guild | undefined {
        return this.guildId === null ? undefined : this.client.guilds.get(this.guildId);
    }

    /** The channel the webhook posts in, if cached. */
    get channel(): Channel | undefined {
        return this.channelId === null ? undefined : this.guild?.channels.get(this.channelId);
    }

    /** The URL that executes the webhook, or `null` without a token. */
    get url(): string | null {
        return this.token === null ? null : `https://discord.com/api/webhooks/${this.id}/${this.token}`;
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIWebhook>): void {
        if (data.channel_id !== undefined) this.channelId = data.channel_id;
        if (data.name !== undefined) this.name = data.name;
        if (data.avatar !== undefined) this.avatar = data.avatar;
        if (data.user !== undefined) this.user = upsertUser(this.client, data.user);
        if (data.token !== undefined) this.token = data.token;
        if (data.application_id !== undefined) this.applicationId = data.application_id;
        if (data.source_guild !== undefined) this.sourceGuild = { id: data.source_guild.id, name: data.source_guild.name, icon: data.source_guild.icon };
        if (data.source_channel !== undefined) this.sourceChannel = { id: data.source_channel.id, name: data.source_channel.name };
    }

    /** Needs the manage webhooks permission. */
    async edit(data: WebhookEditData, reason?: string): Promise<this> {
        this.patch(await this.client.rest.patch('webhook', this.id, data, reason));
        return this;
    }

    /** Needs the manage webhooks permission. */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete('webhook', this.id, reason);
    }

    /** Edits the webhook with its token, so no permission is needed. Only the name and avatar can change. */
    async editWithToken(data: WebhookTokenEditData, reason?: string): Promise<this> {
        this.patch((await this.client.rest.patch('webhookToken', this.id, this.#token(), data, reason)) as APIWebhook);
        return this;
    }

    /** Deletes the webhook with its token, so no permission is needed. */
    async deleteWithToken(reason?: string): Promise<void> {
        await this.client.rest.delete('webhookToken', this.id, this.#token(), reason);
    }

    /** Sends a message through the webhook and waits for it to be created. Needs the token. */
    async send(data: string | WebhookMessageCreateData): Promise<Message> {
        const [{ threadId, ...body }, files] = splitFiles(data);
        const sent = await this.client.rest.post('webhookToken', this.id, this.#token(), body, { files, query: { wait: true, thread_id: threadId } });
        return upsertMessage(this.client, sent!, this.guildId);
    }

    /** Fetches a message the webhook sent. Needs the token. */
    async fetchMessage(messageId: string, threadId?: string): Promise<Message> {
        const message = await this.client.rest.get('webhookTokenMessage', this.id, this.#token(), messageId, { thread_id: threadId });
        return upsertMessage(this.client, message, this.guildId);
    }

    /** Edits a message the webhook sent. Needs the token. */
    async editMessage(messageId: string, data: string | WebhookMessageEditData, threadId?: string): Promise<Message> {
        const [body, files] = splitFiles(data);
        const edited = await this.client.rest.patch('webhookTokenMessage', this.id, this.#token(), messageId, body, { files, query: { thread_id: threadId } });
        return upsertMessage(this.client, edited, this.guildId);
    }

    /** Deletes a message the webhook sent. Needs the token. */
    async deleteMessage(messageId: string, threadId?: string): Promise<void> {
        await this.client.rest.delete('webhookTokenMessage', this.id, this.#token(), messageId, { thread_id: threadId });
    }

    #token(): string {
        if (this.token === null) throw new Error(`Webhook ${this.id} has no token`);
        return this.token;
    }
}
