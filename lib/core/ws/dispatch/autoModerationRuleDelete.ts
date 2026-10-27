import type { DispatchHandler } from '../../../types';
import { AutoModerationRule } from '../../structures';

export const autoModerationRuleDelete: DispatchHandler<'AUTO_MODERATION_RULE_DELETE'> = (client, data) => {
    const rules = client.guilds.get(data.guild_id)?.autoModerationRules;
    const rule = rules?.get(data.id);
    rules?.delete(data.id);
    rule?.patch(data);
    client.emit('autoModerationRuleDelete', rule ?? new AutoModerationRule(client, data));
};
