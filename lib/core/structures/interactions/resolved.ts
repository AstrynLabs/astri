import type { Attachment } from '../../../interfaces';
import type { APIInteractionResolvedData, ClientContext } from '../../../types';
import type { Channel } from '../channels';
import { upsertMember, type Member } from '../member';
import { upsertMessage, type Message } from '../message';
import { Role } from '../role';
import { upsertUser, type User } from '../user';
import { toAttachment } from '../util';
import { resolveChannel } from './util';

/**
 * What an interaction's options or select menu values point to, keyed by id.
 *
 * Users and members are cached like any other. Roles and channels are the cached instances when there are
 * some, otherwise built from the payload without being cached, since interaction payloads only carry part of a
 * channel.
 */
export class InteractionResolved {
    readonly users = new Map<string, User>();
    /** Guild interactions only. */
    readonly members = new Map<string, Member>();
    readonly roles = new Map<string, Role>();
    readonly channels = new Map<string, Channel>();
    /** Message commands only. */
    readonly messages = new Map<string, Message>();
    readonly attachments = new Map<string, Attachment>();

    constructor(client: ClientContext, data: APIInteractionResolvedData | undefined, guildId: string | null) {
        if (data === undefined) return;
        for (const [id, user] of Object.entries(data.users ?? {})) this.users.set(id, upsertUser(client, user));
        if (guildId !== null) {
            for (const [id, member] of Object.entries(data.members ?? {})) {
                const user = data.users?.[id];
                if (user !== undefined) this.members.set(id, upsertMember(client, { ...member, user }, guildId));
            }
            const roles = client.guilds.get(guildId)?.roles;
            for (const [id, role] of Object.entries(data.roles ?? {})) {
                const cached = roles?.get(id);
                cached?.patch(role);
                this.roles.set(id, cached ?? new Role(client, role, guildId));
            }
        }
        for (const [id, channel] of Object.entries(data.channels ?? {})) this.channels.set(id, resolveChannel(client, channel, guildId));
        for (const [id, message] of Object.entries(data.messages ?? {})) this.messages.set(id, upsertMessage(client, message, guildId));
        for (const [id, attachment] of Object.entries(data.attachments ?? {})) this.attachments.set(id, toAttachment(attachment));
    }
}
