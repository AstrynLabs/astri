import type { DispatchHandler } from '../../../types';
import { toSubscription } from '../../structures/util';

export const subscriptionCreate: DispatchHandler<'SUBSCRIPTION_CREATE'> = (client, data) => {
    client.emit('subscriptionCreate', toSubscription(data));
};
