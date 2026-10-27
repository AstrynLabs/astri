import type { DispatchHandler } from '../../../types';
import { upsertAutoModerationRule } from '../../structures';

export const autoModerationRuleUpdate: DispatchHandler<'AUTO_MODERATION_RULE_UPDATE'> = (client, data) => {
    const old = client.guilds.get(data.guild_id)?.autoModerationRules.get(data.id)?.clone() ?? null;
    client.emit('autoModerationRuleUpdate', upsertAutoModerationRule(client, data), old);
};
