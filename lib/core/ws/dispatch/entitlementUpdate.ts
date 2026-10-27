import type { DispatchHandler } from '../../../types';
import { upsertEntitlement } from '../../structures';

export const entitlementUpdate: DispatchHandler<'ENTITLEMENT_UPDATE'> = (client, data) => {
    const old = client.entitlements.get(data.id)?.clone() ?? null;
    client.emit('entitlementUpdate', upsertEntitlement(client, data), old);
};
