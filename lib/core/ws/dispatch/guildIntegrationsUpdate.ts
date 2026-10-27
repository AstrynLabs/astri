import type { DispatchHandler } from '../../../types';

export const guildIntegrationsUpdate: DispatchHandler<'GUILD_INTEGRATIONS_UPDATE'> = (client, data) => {
    client.emit('guildIntegrationsUpdate', data.guild_id, client.guilds.get(data.guild_id) ?? null);
};
