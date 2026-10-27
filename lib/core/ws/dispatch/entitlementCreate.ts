import type { DispatchHandler } from '../../../types';
import { upsertEntitlement } from '../../structures';

export const entitlementCreate: DispatchHandler<'ENTITLEMENT_CREATE'> = (client, data) => {
    client.emit('entitlementCreate', upsertEntitlement(client, data));
};
