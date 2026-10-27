import type { DispatchHandler } from '../../../types';
import { toActionExecution } from '../../structures/util';

export const autoModerationActionExecution: DispatchHandler<'AUTO_MODERATION_ACTION_EXECUTION'> = (client, data) => {
    client.emit('autoModerationActionExecution', toActionExecution(data));
};
