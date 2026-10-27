import type { User } from '../core/structures';

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
