import type { DispatchHandler } from '../../../types';
import { toCommandPermissions } from '../../structures/util';

export const applicationCommandPermissionsUpdate: DispatchHandler<'APPLICATION_COMMAND_PERMISSIONS_UPDATE'> = (client, data) => {
    client.emit('applicationCommandPermissionsUpdate', toCommandPermissions(data));
};
