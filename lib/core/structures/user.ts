import type { APIUser, ClientContext } from '../../types';
import { Base } from './base';

export class User extends Base {
    username: string;
    globalName: string | null;
    discriminator: string;
    avatar: string | null;
    bot = false;
    system = false;
    publicFlags = 0;

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
