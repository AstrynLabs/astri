import type { DispatchHandler } from '../../../types';
import { toSubscription } from '../../structures/util';

export const subscriptionDelete: DispatchHandler<'SUBSCRIPTION_DELETE'> = (client, data) => {
    client.emit('subscriptionDelete', toSubscription(data));
};
