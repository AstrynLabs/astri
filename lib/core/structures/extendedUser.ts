import type { APICurrentUser, ClientContext, CurrentUserEditData } from '../../types';
import { User } from './user';

/** The client's own user, with the account details only it can see. */
export class ExtendedUser extends User {
    mfaEnabled = false;
    verified = false;
    /** Chosen language. `null` until Discord sends it. */
    locale: string | null = null;
    /** Always `null` for bots. */
    email: string | null = null;
    flags = 0;

    constructor(client: ClientContext, data: APICurrentUser) {
        super(client, data);
        this.patch(data);
    }

    override patch(data: Partial<APICurrentUser>): void {
        super.patch(data);
        if (data.mfa_enabled !== undefined) this.mfaEnabled = data.mfa_enabled;
        if (data.verified !== undefined) this.verified = data.verified;
        if (data.locale !== undefined) this.locale = data.locale;
        if (data.email !== undefined) this.email = data.email;
        if (data.flags !== undefined) this.flags = data.flags;
    }

    /** Changes the client's username, avatar or banner. Username changes are heavily rate limited. */
    async edit(data: CurrentUserEditData): Promise<this> {
        this.patch((await this.client.rest.patch('currentUser', data)) as APICurrentUser);
        return this;
    }
}

/**
 * The client's own user patched with `data`, or a new {@link ExtendedUser}. It replaces any plain {@link User}
 * cached for the same id, so the users cache always holds the extended one.
 */
export function upsertExtendedUser(client: ClientContext, data: APICurrentUser): ExtendedUser {
    const current = client.user?.id === data.id ? client.user : client.users.get(data.id);
    if (current instanceof ExtendedUser) {
        current.patch(data);
        if (client.users.get(data.id) !== current) client.users.set(data.id, current);
        return current;
    }
    const created = new ExtendedUser(client, data);
    client.users.set(created.id, created);
    return created;
}
