import type { Member, Presence, User } from '../core/structures';

export interface GuildBan {
    user: User;
    /** What the moderator gave as the reason, if anything. */
    reason: string | null;
}

export interface BulkBanResult {
    bannedUsers: string[];
    /** Already banned, or could not be banned. */
    failedUsers: string[];
}

/** One `GUILD_MEMBERS_CHUNK`, sent in reply to a guild members request. */
export interface GuildMembersChunk {
    guildId: string;
    members: Member[];
    /** Empty unless the request asked for presences. */
    presences: Presence[];
    /** Requested user ids that are not members. */
    notFound: string[];
    chunkIndex: number;
    chunkCount: number;
    /** The request's nonce, or `null` if it had none. */
    nonce: string | null;
}

/** A guild members request waiting for its chunks. */
export interface PendingMemberRequest {
    members: Member[];
    /** Ms to wait for each chunk. */
    timeout: number;
    timer: ReturnType<typeof setTimeout>;
    resolve(members: Member[]): void;
    reject(error: Error): void;
}
