import type { ChannelTypes } from '../../../constants';
import type { APIChannel, ClientContext } from '../../../types';
import type { Cache } from '../../cache';
import type { Message } from '../message';
import { upsertUser, type User } from '../user';
import { parseTimestamp } from '../util';
import { Channel } from './channel';

/** Shared fields of DMs and group DMs. */
export abstract class PrivateChannel extends Channel {
    /** Everyone in the channel except the client's own user. */
    recipients: User[] = [];
    lastMessageId: string | null = null;
    /** Unix ms of the latest pin, or `null`. */
    lastPinTimestamp: number | null = null;
    /** Cached messages, filled as they are sent, edited or fetched. */
    readonly messages: Cache<string, Message>;

    constructor(client: ClientContext, data: APIChannel) {
        super(client, data);
        this.messages = client.cache.create('messages');
    }

    override patch(data: Partial<APIChannel>): void {
        super.patch(data);
        if (data.recipients !== undefined) this.recipients = data.recipients.map((user) => upsertUser(this.client, user));
        if (data.last_message_id !== undefined) this.lastMessageId = data.last_message_id;
        if (data.last_pin_timestamp !== undefined) this.lastPinTimestamp = parseTimestamp(data.last_pin_timestamp);
    }
}

export class DMChannel extends PrivateChannel {
    declare readonly type: typeof ChannelTypes.DM;

    constructor(client: ClientContext, data: APIChannel) {
        super(client, data);
        this.patch(data);
    }

    /** The user on the other end, if known. */
    get recipient(): User | undefined {
        return this.recipients[0];
    }
}

export class GroupDMChannel extends PrivateChannel {
    declare readonly type: typeof ChannelTypes.GroupDM;
    name: string | null = null;
    icon: string | null = null;
    ownerId: string;
    /** Set when the group DM was created by an application. */
    applicationId: string | null = null;

    constructor(client: ClientContext, data: APIChannel) {
        super(client, data);
        this.patch(data);
    }

    override patch(data: Partial<APIChannel>): void {
        super.patch(data);
        if (data.name !== undefined) this.name = data.name;
        if (data.icon !== undefined) this.icon = data.icon;
        if (data.owner_id !== undefined) this.ownerId = data.owner_id;
        if (data.application_id !== undefined) this.applicationId = data.application_id;
    }
}
