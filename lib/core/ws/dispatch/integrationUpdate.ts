import type { DispatchHandler } from '../../../types';
import { GuildIntegration } from '../../structures';

export const integrationUpdate: DispatchHandler<'INTEGRATION_UPDATE'> = (client, data) => {
    client.emit('integrationUpdate', new GuildIntegration(client, data, data.guild_id));
};
