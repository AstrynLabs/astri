import type { APIChannel, APIUser, ClientContext, MessageCreateData } from '../../types';
import { Base } from './base';
import { DMChannel } from './channels';
import type { Message } from './message';

export class User extends Base {
    username: string;
    globalName: string | null;
    discriminator: string;
    avatar: string | null;
    bot = false;
    system = false;
    publicFlags = 0;
    /** The DM with this user, once {@link User.createDM} has opened it. Reused so later sends skip the request. */
    dmChannel: DMChannel | null = null;

    constructor(client: ClientContext, data: APIUser) {
        super(client, data.id);
        this.patch(data);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIUser>): void {
        if (data.username !== undefined) this.username = data.username;
        if (data.global_name !== undefined) this.globalName = data.global_name;
        if (data.discriminator !== undefined) this.discriminator = data.discriminator;
        if (data.avatar !== undefined) this.avatar = data.avatar;
        if (data.bot !== undefined) this.bot = data.bot;
        if (data.system !== undefined) this.system = data.system;
        if (data.public_flags !== undefined) this.publicFlags = data.public_flags;
    }

    /** Opens the DM with this user, or returns the one already opened. */
    async createDM(): Promise<DMChannel> {
        if (this.dmChannel !== null) return this.dmChannel;
        const channel = await this.client.rest.post('currentUserChannels', { recipient_id: this.id });
        this.dmChannel = new DMChannel(this.client, channel as unknown as APIChannel);
        return this.dmChannel;
    }

    /** Sends a DM, opening the channel first if needed. Fails if the user does not accept DMs from the client. */
    async send(data: string | MessageCreateData): Promise<Message> {
        return (await this.createDM()).send(data);
    }
}

/** The cached user for `data.id` patched with `data`, or a new one, cached if the users cache is enabled. */
export function upsertUser(client: ClientContext, data: APIUser): User {
    const user = client.users.get(data.id);
    if (user !== undefined) {
        user.patch(data);
        return user;
    }
    const created = new User(client, data);
    client.users.set(created.id, created);
    return created;
}
