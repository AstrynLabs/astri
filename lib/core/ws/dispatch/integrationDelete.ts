import type { DispatchHandler } from '../../../types';

export const integrationDelete: DispatchHandler<'INTEGRATION_DELETE'> = (client, data) => {
    client.emit('integrationDelete', data.id, data.guild_id, data.application_id ?? null);
};
