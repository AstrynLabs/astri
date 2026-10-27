import type { DispatchHandler } from '../../../types';
import { Entitlement } from '../../structures';

export const entitlementDelete: DispatchHandler<'ENTITLEMENT_DELETE'> = (client, data) => {
    const entitlement = client.entitlements.get(data.id);
    client.entitlements.delete(data.id);
    entitlement?.patch(data);
    client.emit('entitlementDelete', entitlement ?? new Entitlement(client, data));
};
