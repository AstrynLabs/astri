import type { DispatchHandler } from '../../../types';
import { GuildIntegration } from '../../structures';

export const integrationCreate: DispatchHandler<'INTEGRATION_CREATE'> = (client, data) => {
    client.emit('integrationCreate', new GuildIntegration(client, data, data.guild_id));
};
