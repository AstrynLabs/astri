import { MessageFlags } from '../../constants';
import type { Attachment, MessageReaction, Poll } from '../../interfaces';
import type { APIChannel, APIEmbed, APIMessageComponent, APIMessageInteractionMetadata, APIMessageReference, APIMessageSnapshot, APIStickerItem, ClientContext, EmojiResolvable, GatewayMessageCreateData, MessageCreateData, MessageData, MessageEditData, TextBasedChannel } from '../../types';
import { Collection } from '../cache';
import { Base } from './base';
import { upsertThread, type ThreadChannel } from './channels';
import type { Guild } from './guild';
import { upsertMember, type Member } from './member';
import { upsertUser, type User } from './user';
import { emojiParam, getTextChannel, parseTimestamp, reactionKey, splitFiles, toAttachment, toPoll, toReaction } from './util';

/**
 * A message in a channel, thread or DM. Messages are cached on their channel's `messages`, so messages in DMs,
 * whose channels are not cached, are never cached.
 */
export class Message extends Base {
    readonly channelId: string;
    /** `null` in DMs. */
    readonly guildId: string | null;
    /** One of {@link MessageTypes}. */
    readonly type: number;
    author: User;
    /** The author's guild membership. Only sent with gateway guild messages, and never for webhooks. */
    member: Member | null = null;
    /** Empty without the message content intent, unless the client is mentioned or wrote it. */
    content = '';
    /** Unix ms of the last edit, or `null` if never edited. */
    editedTimestamp: number | null = null;
    tts = false;
    mentionEveryone = false;
    mentions: User[] = [];
    mentionRoles: string[] = [];
    attachments: Attachment[] = [];
    embeds: APIEmbed[] = [];
    components: APIMessageComponent[] = [];
    stickerItems: APIStickerItem[] = [];
    /** Keyed by custom emoji id, or by the emoji itself for unicode ones. Kept current by reaction events while cached. */
    reactions = new Collection<string, MessageReaction>();
    pinned = false;
    flags = 0;
    /** Set when a webhook sent the message. */
    webhookId: string | null = null;
    /** Set when an application sent the message through an interaction, or it is a Rich Presence invite. */
    applicationId: string | null = null;
    /** What the message replies to, forwards, or was crossposted from. */
    reference: APIMessageReference | null = null;
    /** Replies only: the message replied to, or `null` if it was deleted or not sent. */
    referencedMessage: Message | null = null;
    /** Forwards only: copies of the forwarded messages. */
    messageSnapshots: APIMessageSnapshot[] = [];
    /** The thread started from this message. */
    thread: ThreadChannel | null = null;
    /** Kept current by vote events while cached. */
    poll: Poll | null = null;
    /** Set when the message is a response to an interaction. */
    interactionMetadata: APIMessageInteractionMetadata | null = null;
    /** What the client sent to check the message was delivered. */
    nonce: string | number | null = null;
    /** Thread messages only: roughly where the message is in the thread. */
    position: number | null = null;

    constructor(client: ClientContext, data: MessageData, guildId: string | null = data.guild_id ?? null) {
        super(client, data.id);
        this.channelId = data.channel_id;
        this.guildId = guildId;
        this.type = data.type ?? 0;
        this.patch(data);
    }

    /** The guild the message was sent in, if cached. */
    get guild(): Guild | undefined {
        return this.guildId === null ? undefined : this.client.guilds.get(this.guildId);
    }

    /** The channel or thread the message was sent in, if cached. Always `undefined` in DMs. */
    get channel(): TextBasedChannel | undefined {
        return getTextChannel(this.client, this.channelId, this.guildId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<GatewayMessageCreateData>): void {
        if (data.author !== undefined) {
            this.author = upsertUser(this.client, data.author);
            if (data.member !== undefined && this.guildId !== null) this.member = upsertMember(this.client, { ...data.member, user: data.author }, this.guildId);
        }
        if (data.content !== undefined) this.content = data.content;
        if (data.edited_timestamp !== undefined) this.editedTimestamp = parseTimestamp(data.edited_timestamp);
        if (data.tts !== undefined) this.tts = data.tts;
        if (data.mention_everyone !== undefined) this.mentionEveryone = data.mention_everyone;
        if (data.mentions !== undefined) {
            const guildId = this.guildId;
            this.mentions = data.mentions.map((user) => (user.member !== undefined && guildId !== null ? upsertMember(this.client, { ...user.member, user }, guildId).user : upsertUser(this.client, user)));
        }
        if (data.mention_roles !== undefined) this.mentionRoles = data.mention_roles;
        if (data.attachments !== undefined) this.attachments = data.attachments.map(toAttachment);
        if (data.embeds !== undefined) this.embeds = data.embeds;
        if (data.components !== undefined) this.components = data.components;
        if (data.sticker_items !== undefined) this.stickerItems = data.sticker_items;
        if (data.reactions !== undefined) this.reactions = new Collection(data.reactions.map((reaction) => [reactionKey(reaction.emoji), toReaction(reaction)]));
        if (data.pinned !== undefined) this.pinned = data.pinned;
        if (data.flags !== undefined) this.flags = data.flags;
        if (data.webhook_id !== undefined) this.webhookId = data.webhook_id;
        if (data.application_id !== undefined) this.applicationId = data.application_id;
        if (data.message_reference !== undefined) this.reference = data.message_reference;
        if (data.referenced_message !== undefined) this.referencedMessage = data.referenced_message === null ? null : upsertMessage(this.client, data.referenced_message, this.guildId);
        if (data.message_snapshots !== undefined) this.messageSnapshots = data.message_snapshots;
        if (data.thread !== undefined && this.guildId !== null) this.thread = upsertThread(this.client, data.thread as unknown as APIChannel, this.guildId);
        if (data.poll !== undefined) this.poll = toPoll(data.poll);
        if (data.interaction_metadata !== undefined) this.interactionMetadata = data.interaction_metadata;
        if (data.nonce !== undefined) this.nonce = data.nonce;
        if (data.position !== undefined) this.position = data.position;
    }

    /** Sends a message in the same channel replying to this one. */
    async reply(data: string | MessageCreateData): Promise<Message> {
        const [body, files] = splitFiles(data);
        const sent = await this.client.rest.post('channelMessage', this.channelId, { message_reference: { message_id: this.id }, ...body }, { files });
        return upsertMessage(this.client, sent, this.guildId);
    }

    /** Edits the message. Only the author can change its content; anyone with manage messages can suppress embeds through `flags`. */
    async edit(data: string | MessageEditData): Promise<this> {
        const [body, files] = splitFiles(data);
        this.patch(await this.client.rest.patch('channelMessage', this.channelId, this.id, body, { files }));
        return this;
    }

    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete('channelMessage', this.channelId, this.id, reason);
    }

    /** Reacts as the client's own user. */
    async react(emoji: EmojiResolvable): Promise<void> {
        await this.client.rest.put('channelMessageOwnReaction', this.channelId, this.id, emojiParam(emoji));
    }

    /** Removes one user's reaction, the client's own by default. Others' need the manage messages permission. */
    async removeReaction(emoji: EmojiResolvable, userId?: string): Promise<void> {
        if (userId === undefined) await this.client.rest.delete('channelMessageOwnReaction', this.channelId, this.id, emojiParam(emoji));
        else await this.client.rest.delete('channelMessageUserReaction', this.channelId, this.id, emojiParam(emoji), userId);
    }

    /** Removes every reaction, or every reaction with `emoji`. Needs the manage messages permission. */
    async removeReactions(emoji?: EmojiResolvable): Promise<void> {
        if (emoji === undefined) await this.client.rest.delete('channelMessageReactions', this.channelId, this.id);
        else await this.client.rest.delete('channelMessageReaction', this.channelId, this.id, emojiParam(emoji));
    }

    async pin(reason?: string): Promise<void> {
        await this.client.rest.put('channelMessagesPin', this.channelId, this.id, reason);
    }

    async unpin(reason?: string): Promise<void> {
        await this.client.rest.delete('channelMessagesPin', this.channelId, this.id, reason);
    }

    /** Announcement channels only: sends the message to every channel following this one. */
    async crosspost(): Promise<this> {
        this.patch(await this.client.rest.post('channelMessageCrosspost', this.channelId, this.id));
        return this;
    }
}

/**
 * The cached message for `data.id` patched with `data`, or a new one, cached if its channel is. Ephemeral messages
 * are never cached, since no event updates or deletes them.
 */
export function upsertMessage(client: ClientContext, data: MessageData, guildId: string | null = data.guild_id ?? null): Message {
    const messages = getTextChannel(client, data.channel_id, guildId)?.messages;
    const cached = messages?.get(data.id);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new Message(client, data, guildId);
    if ((created.flags & MessageFlags.Ephemeral) === 0) messages?.set(created.id, created);
    return created;
}
