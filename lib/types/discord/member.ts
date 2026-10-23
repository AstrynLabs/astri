import type { APIUser } from './user';

export interface APIGuildMember {
    user: APIUser;
    nick?: string | null;
    avatar?: string | null;
    roles: string[];
    /** ISO 8601 timestamp. `null` for guest members of voice channels. */
    joined_at: string | null;
    premium_since?: string | null;
    deaf: boolean;
    mute: boolean;
    flags: number;
    pending?: boolean;
    communication_disabled_until?: string | null;
}
