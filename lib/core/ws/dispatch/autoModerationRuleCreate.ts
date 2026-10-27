import type { DispatchHandler } from '../../../types';
import { upsertAutoModerationRule } from '../../structures';

export const autoModerationRuleCreate: DispatchHandler<'AUTO_MODERATION_RULE_CREATE'> = (client, data) => {
    client.emit('autoModerationRuleCreate', upsertAutoModerationRule(client, data));
};
