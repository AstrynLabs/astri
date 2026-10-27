import type { ClientContext, DispatchHandler, DispatchHandlers, GatewayDispatchData, GatewayDispatchPayload } from '../../../types';
import type { Shard } from '../shard';
import { applicationCommandPermissionsUpdate } from './applicationCommandPermissionsUpdate';
import { autoModerationActionExecution } from './autoModerationActionExecution';
import { autoModerationRuleCreate } from './autoModerationRuleCreate';
import { autoModerationRuleDelete } from './autoModerationRuleDelete';
import { autoModerationRuleUpdate } from './autoModerationRuleUpdate';
import { channelCreate } from './channelCreate';
import { channelDelete } from './channelDelete';
import { channelPinsUpdate } from './channelPinsUpdate';
import { channelUpdate } from './channelUpdate';
import { entitlementCreate } from './entitlementCreate';
import { entitlementDelete } from './entitlementDelete';
import { entitlementUpdate } from './entitlementUpdate';
import { guildBanAdd } from './guildBanAdd';
import { guildBanRemove } from './guildBanRemove';
import { guildCreate } from './guildCreate';
import { guildDelete } from './guildDelete';
import { guildEmojisUpdate } from './guildEmojisUpdate';
import { guildMemberAdd } from './guildMemberAdd';
import { guildMemberRemove } from './guildMemberRemove';
import { guildMembersChunk } from './guildMembersChunk';
import { guildMemberUpdate } from './guildMemberUpdate';
import { guildRoleCreate } from './guildRoleCreate';
import { guildRoleDelete } from './guildRoleDelete';
import { guildRoleUpdate } from './guildRoleUpdate';
import { guildScheduledEventCreate } from './guildScheduledEventCreate';
import { guildScheduledEventDelete } from './guildScheduledEventDelete';
import { guildScheduledEventUpdate } from './guildScheduledEventUpdate';
import { guildScheduledEventUserAdd } from './guildScheduledEventUserAdd';
import { guildScheduledEventUserRemove } from './guildScheduledEventUserRemove';
import { guildStickersUpdate } from './guildStickersUpdate';
import { guildUpdate } from './guildUpdate';
import { interactionCreate } from './interactionCreate';
import { inviteCreate } from './inviteCreate';
import { inviteDelete } from './inviteDelete';
import { messageCreate } from './messageCreate';
import { messageDelete } from './messageDelete';
import { messageDeleteBulk } from './messageDeleteBulk';
import { messagePollVoteAdd } from './messagePollVoteAdd';
import { messagePollVoteRemove } from './messagePollVoteRemove';
import { messageReactionAdd } from './messageReactionAdd';
import { messageReactionRemove } from './messageReactionRemove';
import { messageReactionRemoveAll } from './messageReactionRemoveAll';
import { messageReactionRemoveEmoji } from './messageReactionRemoveEmoji';
import { messageUpdate } from './messageUpdate';
import { presenceUpdate } from './presenceUpdate';
import { stageInstanceCreate } from './stageInstanceCreate';
import { stageInstanceDelete } from './stageInstanceDelete';
import { stageInstanceUpdate } from './stageInstanceUpdate';
import { threadCreate } from './threadCreate';
import { threadDelete } from './threadDelete';
import { threadListSync } from './threadListSync';
import { threadMembersUpdate } from './threadMembersUpdate';
import { threadMemberUpdate } from './threadMemberUpdate';
import { threadUpdate } from './threadUpdate';
import { typingStart } from './typingStart';
import { voiceStateUpdate } from './voiceStateUpdate';
import { webhooksUpdate } from './webhooksUpdate';

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
    GUILD_MEMBERS_CHUNK: guildMembersChunk,
    GUILD_BAN_ADD: guildBanAdd,
    GUILD_BAN_REMOVE: guildBanRemove,
    GUILD_EMOJIS_UPDATE: guildEmojisUpdate,
    GUILD_STICKERS_UPDATE: guildStickersUpdate,
    GUILD_SCHEDULED_EVENT_CREATE: guildScheduledEventCreate,
    GUILD_SCHEDULED_EVENT_UPDATE: guildScheduledEventUpdate,
    GUILD_SCHEDULED_EVENT_DELETE: guildScheduledEventDelete,
    GUILD_SCHEDULED_EVENT_USER_ADD: guildScheduledEventUserAdd,
    GUILD_SCHEDULED_EVENT_USER_REMOVE: guildScheduledEventUserRemove,
    CHANNEL_CREATE: channelCreate,
    CHANNEL_UPDATE: channelUpdate,
    CHANNEL_DELETE: channelDelete,
    CHANNEL_PINS_UPDATE: channelPinsUpdate,
    THREAD_CREATE: threadCreate,
    THREAD_UPDATE: threadUpdate,
    THREAD_DELETE: threadDelete,
    THREAD_LIST_SYNC: threadListSync,
    THREAD_MEMBER_UPDATE: threadMemberUpdate,
    THREAD_MEMBERS_UPDATE: threadMembersUpdate,
    MESSAGE_CREATE: messageCreate,
    MESSAGE_UPDATE: messageUpdate,
    MESSAGE_DELETE: messageDelete,
    MESSAGE_DELETE_BULK: messageDeleteBulk,
    MESSAGE_REACTION_ADD: messageReactionAdd,
    MESSAGE_REACTION_REMOVE: messageReactionRemove,
    MESSAGE_REACTION_REMOVE_ALL: messageReactionRemoveAll,
    MESSAGE_REACTION_REMOVE_EMOJI: messageReactionRemoveEmoji,
    MESSAGE_POLL_VOTE_ADD: messagePollVoteAdd,
    MESSAGE_POLL_VOTE_REMOVE: messagePollVoteRemove,
    TYPING_START: typingStart,
    INTERACTION_CREATE: interactionCreate,
    INVITE_CREATE: inviteCreate,
    INVITE_DELETE: inviteDelete,
    WEBHOOKS_UPDATE: webhooksUpdate,
    VOICE_STATE_UPDATE: voiceStateUpdate,
    PRESENCE_UPDATE: presenceUpdate,
    AUTO_MODERATION_RULE_CREATE: autoModerationRuleCreate,
    AUTO_MODERATION_RULE_UPDATE: autoModerationRuleUpdate,
    AUTO_MODERATION_RULE_DELETE: autoModerationRuleDelete,
    AUTO_MODERATION_ACTION_EXECUTION: autoModerationActionExecution,
    STAGE_INSTANCE_CREATE: stageInstanceCreate,
    STAGE_INSTANCE_UPDATE: stageInstanceUpdate,
    STAGE_INSTANCE_DELETE: stageInstanceDelete,
    ENTITLEMENT_CREATE: entitlementCreate,
    ENTITLEMENT_UPDATE: entitlementUpdate,
    ENTITLEMENT_DELETE: entitlementDelete,
    APPLICATION_COMMAND_PERMISSIONS_UPDATE: applicationCommandPermissionsUpdate
};

/** Runs the handler for `payload.t`. Dispatches without one are ignored. */
export function handleDispatch(client: ClientContext, payload: GatewayDispatchPayload, shard: Shard): void {
    if (!Object.hasOwn(dispatchHandlers, payload.t)) return;
    const handler = dispatchHandlers[payload.t as keyof GatewayDispatchData] as DispatchHandler<keyof GatewayDispatchData>;
    handler(client, payload.d as GatewayDispatchData[keyof GatewayDispatchData], shard);
}
