import type { APIThreadMember, ClientContext } from '../../types';
import { Base } from './base';
import type { ThreadChannel } from './channels';
import type { Guild } from './guild';
import type { Member } from './member';
import type { User } from './user';

/** A user's membership in one thread. Shares its `id` with the user. */
export class ThreadMember extends Base {
    readonly threadId: string;
    readonly guildId: string;
    /** Unix ms. */
    joinedAt: number;
    flags = 0;

    constructor(client: ClientContext, data: APIThreadMember, threadId: string, guildId: string, userId: string) {
        super(client, userId);
        this.threadId = threadId;
        this.guildId = guildId;
        this.patch(data);
    }

    /** The guild the thread belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** The thread, if cached. */
    get thread(): ThreadChannel | undefined {
        return this.guild?.threads.get(this.threadId);
    }

    /** The user, if cached. */
    get user(): User | undefined {
        return this.client.users.get(this.id);
    }

    /** The user's guild membership, if cached. */
    get guildMember(): Member | undefined {
        return this.guild?.members.get(this.id);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. A `member` is cached on the guild. */
    patch(data: Partial<APIThreadMember>): void {
        if (data.join_timestamp !== undefined) this.joinedAt = Date.parse(data.join_timestamp);
        if (data.flags !== undefined) this.flags = data.flags;
        if (data.member !== undefined) this.guild?.patch({ members: [data.member] });
    }
}
