import type { RESTBody } from './rest';

/** Changes to an auto moderation rule. Fields left out are kept. */
export type AutoModerationRuleEditData = RESTBody<'/guilds/{guild_id}/auto-moderation/rules/{rule_id}', 'patch'>;
