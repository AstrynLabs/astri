import type { RESTBody } from './rest';

/** Changes to an auto moderation rule. Fields left out are kept. */
export type AutoModerationRuleEditData = RESTBody<'/guilds/{guild_id}/auto-moderation/rules/{rule_id}', 'patch'>;

/** A new auto moderation rule. Which `trigger_metadata` applies depends on `trigger_type`. */
export type AutoModerationRuleCreateData = RESTBody<'/guilds/{guild_id}/auto-moderation/rules', 'post'>;
