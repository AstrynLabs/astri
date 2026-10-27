import type { ActivityTypes } from '../../constants';
import type { PresenceStatus } from '../gateway';
import type { APIUser } from './user';

export interface APIActivityEmoji {
    name: string;
    id?: string;
    animated?: boolean;
}

/** What a user is doing, as shown on their profile. */
export interface APIActivity {
    name: string;
    type: ActivityTypes;
    /** Streaming activities only. */
    url?: string | null;
    /** Unix ms the activity was added to the session. */
    created_at: number;
    /** Unix ms. */
    timestamps?: { start?: number; end?: number };
    application_id?: string;
    /** Which field is shown in the member list: `0` name, `1` state, `2` details. */
    status_display_type?: number | null;
    details?: string | null;
    details_url?: string | null;
    state?: string | null;
    state_url?: string | null;
    /** Custom statuses only. */
    emoji?: APIActivityEmoji | null;
    /** `size` is the current and the maximum party size. */
    party?: { id?: string; size?: [current: number, max: number] };
    assets?: { large_image?: string; large_text?: string; large_url?: string; small_image?: string; small_text?: string; small_url?: string };
    secrets?: { join?: string; spectate?: string; match?: string };
    instance?: boolean;
    flags?: number;
    /** Labels of the buttons shown on the activity. */
    buttons?: string[];
}

/** The status on each platform the user is signed in on. Platforms they are offline on are left out. */
export interface APIClientStatus {
    desktop?: PresenceStatus;
    mobile?: PresenceStatus;
    web?: PresenceStatus;
}

/** A user's presence in one guild. */
export interface APIPresence {
    /** Only `id` is guaranteed. Other fields are sent when they changed. */
    user: Partial<APIUser> & { id: string };
    /** Left out of the presences inside `GUILD_CREATE`. */
    guild_id?: string;
    status: PresenceStatus;
    activities: APIActivity[];
    client_status: APIClientStatus;
}
