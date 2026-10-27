import type { ChannelTypes, InviteTargetTypes, InviteTypes } from '../../constants';
import type { components } from './openapi';
import type { APIGuildScheduledEvent } from './scheduledEvent';
import type { APIUser } from './user';

type Schemas = components['schemas'];

export type APIInviteGuild = Schemas['InviteGuildResponse'];
export type APIInviteApplication = Schemas['InviteApplicationResponse'];

export interface APIInviteChannel {
    id: string;
    type: ChannelTypes;
    name: string | null;
}

/** An invite from REST or the gateway. Usage fields are only sent to members who can manage the guild or channel. */
export interface APIInvite {
    code: string;
    /** Left out of gateway invites, which are always guild invites. */
    type?: InviteTypes;
    guild?: APIInviteGuild;
    guild_id?: string;
    channel?: APIInviteChannel | null;
    /** Gateway invites only, which leave out `channel`. */
    channel_id?: string;
    inviter?: APIUser;
    target_type?: InviteTargetTypes;
    target_user?: APIUser;
    target_application?: APIInviteApplication;
    approximate_presence_count?: number | null;
    approximate_member_count?: number | null;
    /** ISO 8601 timestamp, or `null` if it never expires. */
    expires_at?: string | null;
    guild_scheduled_event?: APIGuildScheduledEvent;
    flags?: number;
    uses?: number;
    /** `0` means unlimited. */
    max_uses?: number;
    /** Seconds the invite is valid for after creation. `0` means forever. */
    max_age?: number;
    /** Whether members who joined through it are kicked when they disconnect, unless given a role. */
    temporary?: boolean;
    /** ISO 8601 timestamp. */
    created_at?: string;
}
