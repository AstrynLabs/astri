import type { ClientContext, DispatchHandler, DispatchHandlers, GatewayDispatchData, GatewayDispatchPayload } from '../../../types';
import type { Shard } from '../shard';
import { guildBanAdd } from './guildBanAdd';
import { guildBanRemove } from './guildBanRemove';
import { guildCreate } from './guildCreate';
import { guildDelete } from './guildDelete';
import { guildEmojisUpdate } from './guildEmojisUpdate';
import { guildMemberAdd } from './guildMemberAdd';
import { guildMemberRemove } from './guildMemberRemove';
import { guildMemberUpdate } from './guildMemberUpdate';
import { guildRoleCreate } from './guildRoleCreate';
import { guildRoleDelete } from './guildRoleDelete';
import { guildRoleUpdate } from './guildRoleUpdate';
import { guildUpdate } from './guildUpdate';

/** The handler for each dispatch the library acts on, keyed by the payload's `t`. */
export const dispatchHandlers: DispatchHandlers = {
    GUILD_CREATE: guildCreate,
    GUILD_UPDATE: guildUpdate,
    GUILD_DELETE: guildDelete,
    GUILD_ROLE_CREATE: guildRoleCreate,
    GUILD_ROLE_UPDATE: guildRoleUpdate,
    GUILD_ROLE_DELETE: guildRoleDelete,
    GUILD_MEMBER_ADD: guildMemberAdd,
    GUILD_MEMBER_UPDATE: guildMemberUpdate,
    GUILD_MEMBER_REMOVE: guildMemberRemove,
    GUILD_BAN_ADD: guildBanAdd,
    GUILD_BAN_REMOVE: guildBanRemove,
    GUILD_EMOJIS_UPDATE: guildEmojisUpdate
};

/** Runs the handler for `payload.t`. Dispatches without one are ignored. */
export function handleDispatch(client: ClientContext, payload: GatewayDispatchPayload, shard: Shard): void {
    if (!Object.hasOwn(dispatchHandlers, payload.t)) return;
    const handler = dispatchHandlers[payload.t as keyof GatewayDispatchData] as DispatchHandler<keyof GatewayDispatchData>;
    handler(client, payload.d as GatewayDispatchData[keyof GatewayDispatchData], shard);
}
