import { InteractionCallbackTypes, MessageFlags, type InteractionContextTypes, type InteractionTypes } from '../../../constants';
import type { APIInteraction, APIMessage, ClientContext, InteractionDeferOptions, InteractionEditData, InteractionMessageData, RESTBody, RESTFile } from '../../../types';
import { Base } from '../base';
import { upsertEntitlement, type Entitlement } from '../entitlement';
import type { Channel } from '../channels';
import type { Guild } from '../guild';
import { upsertMember, type Member } from '../member';
import { upsertMessage, type Message } from '../message';
import { upsertUser, type User } from '../user';
import { splitFiles } from '../util';
import { messageBody, resolveChannel } from './util';
import { Permission } from '../permission';

type InteractionCallbackBody = RESTBody<'/interactions/{interaction_id}/{interaction_token}/callback', 'post'>;

/**
 * Common ground for every interaction. Use {@link createInteraction} to get the subclass matching a payload's
 * `type`.
 *
 * Every interaction must get exactly one initial response within 3 seconds, after which its token stays valid
 * for 15 minutes of follow-ups and edits.
 */
export abstract class Interaction extends Base {
    readonly type: InteractionTypes;
    readonly applicationId: string;
    readonly token: string;
    readonly version: number;
    /** `null` outside guilds. */
    readonly guildId: string | null;
    readonly channelId: string | null;
    /** The cached channel when there is one, otherwise built from the partial channel in the payload. */
    readonly channel: Channel | null;
    /** The user who triggered the interaction. */
    readonly user: User;
    /** Guild interactions only. */
    readonly member: Member | null;
    /** The member's permissions in the channel, overwrites included. Guild interactions only. */
    readonly memberPermissions: Permission | null;
    /** The application's permissions in the channel. */
    readonly appPermissions: Permission;
    /** The user's language. */
    readonly locale: string | null;
    /** The guild's preferred language. Guild interactions only. */
    readonly guildLocale: string | null;
    readonly context: InteractionContextTypes | null;
    /** Installation contexts the interaction is authorized for (`0` guild, `1` user), mapped to the guild or user id that installed the app. */
    readonly authorizingIntegrationOwners: Partial<Record<'0' | '1', string>>;
    /** What the user or guild has bought from the application. Also cached on the client. */
    readonly entitlements: Entitlement[];
    /** Bytes. */
    readonly attachmentSizeLimit: number;
    /** Whether the initial response has been sent. */
    acknowledged = false;

    constructor(client: ClientContext, data: APIInteraction) {
        super(client, data.id);
        this.type = data.type;
        this.applicationId = data.application_id;
        this.token = data.token;
        this.version = data.version;
        this.guildId = data.guild_id ?? null;
        this.channelId = data.channel_id ?? data.channel?.id ?? null;
        this.channel = data.channel === undefined ? null : resolveChannel(client, data.channel, this.guildId);
        this.member = data.member === undefined || this.guildId === null ? null : upsertMember(client, data.member, this.guildId);
        this.user = this.member?.user ?? upsertUser(client, data.user!);
        this.memberPermissions = data.member === undefined ? null : new Permission(data.member.permissions);
        this.appPermissions = new Permission(data.app_permissions);
        this.locale = data.locale ?? null;
        this.guildLocale = data.guild_locale ?? null;
        this.context = data.context ?? null;
        this.authorizingIntegrationOwners = data.authorizing_integration_owners;
        this.entitlements = data.entitlements.map((entitlement) => upsertEntitlement(client, entitlement));
        this.attachmentSizeLimit = data.attachment_size_limit;
    }

    /** The guild the interaction came from, if cached. Not cached for user-installed apps in guilds the bot is not in. */
    get guild(): Guild | undefined {
        return this.guildId === null ? undefined : this.client.guilds.get(this.guildId);
    }

    /** Sends the initial response. Throws if one was already sent. */
    protected async sendCallback(body: InteractionCallbackBody, files?: RESTFile[]): Promise<void> {
        if (this.acknowledged) throw new Error(`Interaction ${this.id} has already been acknowledged`);
        this.acknowledged = true;
        try {
            await this.client.rest.post('interactionCallback', this.id, this.token, body, { files });
        } catch (error) {
            this.acknowledged = false;
            throw error;
        }
    }
}

/** An interaction that can be answered with a message: commands, components and modal submits. */
export abstract class RepliableInteraction extends Interaction {
    /** Whether the initial response was a defer. */
    deferred = false;

    /** Sends the initial response as a new message. */
    reply(data: string | InteractionMessageData): Promise<void> {
        const [body, files] = messageBody(data);
        return this.sendCallback({ type: InteractionCallbackTypes.ChannelMessageWithSource, data: body }, files);
    }

    /** Acknowledges the interaction with a loading state, to reply within 15 minutes through {@link editReply}. */
    async defer(options: InteractionDeferOptions = {}): Promise<void> {
        await this.sendCallback({ type: InteractionCallbackTypes.DeferredChannelMessageWithSource, data: options.ephemeral === true ? { flags: MessageFlags.Ephemeral } : undefined });
        this.deferred = true;
    }

    /** The initial response message. */
    async fetchReply(): Promise<Message> {
        return upsertMessage(this.client, await this.client.rest.get('webhookTokenOriginalMessage', this.applicationId, this.token), this.guildId);
    }

    /** Edits the initial response, or sends it after a {@link defer}. */
    async editReply(data: string | InteractionEditData): Promise<Message> {
        const [body, files] = splitFiles(data);
        return upsertMessage(this.client, await this.client.rest.patch('webhookTokenOriginalMessage', this.applicationId, this.token, body, { files }), this.guildId);
    }

    async deleteReply(): Promise<void> {
        await this.client.rest.delete('webhookTokenOriginalMessage', this.applicationId, this.token);
    }

    /** Sends another message. Needs the initial response to have been sent. */
    async followUp(data: string | InteractionMessageData): Promise<Message> {
        const [body, files] = messageBody(data);
        const sent = (await this.client.rest.post('webhookToken', this.applicationId, this.token, body, { files, query: { wait: true } })) as APIMessage;
        return upsertMessage(this.client, sent, this.guildId);
    }

    async editFollowUp(messageId: string, data: string | InteractionEditData): Promise<Message> {
        const [body, files] = splitFiles(data);
        return upsertMessage(this.client, await this.client.rest.patch('webhookTokenMessage', this.applicationId, this.token, messageId, body, { files }), this.guildId);
    }

    async deleteFollowUp(messageId: string): Promise<void> {
        await this.client.rest.delete('webhookTokenMessage', this.applicationId, this.token, messageId);
    }
}

/** An interaction type the library has no class for, including pings, which only arrive over HTTP. */
export class UnknownInteraction extends Interaction {}
