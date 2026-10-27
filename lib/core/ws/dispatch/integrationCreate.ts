import type { DispatchHandler } from '../../../types';
import { toIntegration } from '../../structures/util';

export const integrationCreate: DispatchHandler<'INTEGRATION_CREATE'> = (client, data) => {
    client.emit('integrationCreate', toIntegration(client, data, data.guild_id));
};
