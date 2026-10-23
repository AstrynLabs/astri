import type { APIGuildEmoji } from './emoji';
import type { APIGuild } from './guild';
import type { APIGuildMember } from './member';
import type { APIRole } from './role';
import type { APIUser } from './user';

/** `GUILD_CREATE` body: the full guild plus fields only sent when the client first receives it. */
export interface GatewayGuildCreateData extends APIGuild {
    joined_at: string;
    large: boolean;
    unavailable?: boolean;
    member_count: number;
    /** Not every member: large guilds leave out offline ones. */
    members: APIGuildMember[];
}

/** `GUILD_DELETE` body. `unavailable` is set when the guild dropped out in an outage, and absent when the client left or was removed. */
export interface GatewayGuildDeleteData {
    id: string;
    unavailable?: boolean;
}

export interface GatewayGuildRoleData {
    guild_id: string;
    role: APIRole;
}

export interface GatewayGuildRoleDeleteData {
    guild_id: string;
    role_id: string;
}

export interface GatewayGuildMemberAddData extends APIGuildMember {
    guild_id: string;
}

/** `GUILD_MEMBER_UPDATE` body. Voice state and flags may be left out. */
export interface GatewayGuildMemberUpdateData extends Omit<APIGuildMember, 'deaf' | 'mute' | 'flags'> {
    guild_id: string;
    deaf?: boolean;
    mute?: boolean;
    flags?: number;
}

export interface GatewayGuildMemberRemoveData {
    guild_id: string;
    user: APIUser;
}

export interface GatewayGuildBanData {
    guild_id: string;
    user: APIUser;
}

export interface GatewayGuildEmojisUpdateData {
    guild_id: string;
    emojis: APIGuildEmoji[];
}

/** Body of every dispatch the library handles, keyed by the payload's `t`. */
export interface GatewayDispatchData {
    GUILD_CREATE: GatewayGuildCreateData;
    GUILD_UPDATE: APIGuild;
    GUILD_DELETE: GatewayGuildDeleteData;
    GUILD_ROLE_CREATE: GatewayGuildRoleData;
    GUILD_ROLE_UPDATE: GatewayGuildRoleData;
    GUILD_ROLE_DELETE: GatewayGuildRoleDeleteData;
    GUILD_MEMBER_ADD: GatewayGuildMemberAddData;
    GUILD_MEMBER_UPDATE: GatewayGuildMemberUpdateData;
    GUILD_MEMBER_REMOVE: GatewayGuildMemberRemoveData;
    GUILD_BAN_ADD: GatewayGuildBanData;
    GUILD_BAN_REMOVE: GatewayGuildBanData;
    GUILD_EMOJIS_UPDATE: GatewayGuildEmojisUpdateData;
}
