import type { DispatchHandler } from '../../../types';
import { toSubscription } from '../../structures/util';

export const subscriptionUpdate: DispatchHandler<'SUBSCRIPTION_UPDATE'> = (client, data) => {
    client.emit('subscriptionUpdate', toSubscription(data));
};
