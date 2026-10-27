import type { Activity, ClientStatus } from '../../interfaces';
import type { APIPresence, APIUser, ClientContext, PresenceStatus } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import type { Member } from './member';
import { upsertUser, type User } from './user';
import { toActivity, toClientStatus } from './util';

/** A user's status and activities in one guild. Shares its `id` with the user. Needs the guild presences intent. */
export class Presence extends Base {
    readonly guildId: string;
    status: PresenceStatus = 'offline';
    /** The first one is shown in the member list. */
    activities: Activity[] = [];
    clientStatus: ClientStatus = { desktop: null, mobile: null, web: null };

    constructor(client: ClientContext, data: APIPresence, guildId: string) {
        super(client, data.user.id);
        this.guildId = guildId;
        this.patch(data);
    }

    /** The guild, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** The user, if cached. */
    get user(): User | undefined {
        return this.client.users.get(this.id);
    }

    /** The user's guild membership, if cached. */
    get member(): Member | undefined {
        return this.guild?.members.get(this.id);
    }

    /**
     * Applies a payload. Fields missing from `data` keep their current value. Changed user fields are applied to the
     * cached user, or cache a new one when the full user was sent.
     */
    patch(data: Partial<APIPresence>): void {
        if (data.user !== undefined) {
            const cached = this.client.users.peek(data.user.id);
            if (cached !== undefined) cached.patch(data.user);
            else if (data.user.username !== undefined) upsertUser(this.client, data.user as APIUser);
        }
        if (data.status !== undefined) this.status = data.status;
        if (data.activities !== undefined) this.activities = data.activities.map(toActivity);
        if (data.client_status !== undefined) this.clientStatus = toClientStatus(data.client_status);
    }
}

/** The cached presence for `data.user.id` patched with `data`, or a new one, cached if its guild is. Offline presences are dropped from the cache. */
export function upsertPresence(client: ClientContext, data: APIPresence, guildId: string): Presence {
    const presences = client.guilds.get(guildId)?.presences;
    let presence = presences?.get(data.user.id);
    if (presence !== undefined) presence.patch(data);
    else presence = new Presence(client, data, guildId);
    if (presence.status === 'offline') presences?.delete(presence.id);
    else presences?.set(presence.id, presence);
    return presence;
}
