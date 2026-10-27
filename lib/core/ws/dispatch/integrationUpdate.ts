import type { DispatchHandler } from '../../../types';
import { toIntegration } from '../../structures/util';

export const integrationUpdate: DispatchHandler<'INTEGRATION_UPDATE'> = (client, data) => {
    client.emit('integrationUpdate', toIntegration(client, data, data.guild_id));
};
