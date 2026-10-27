import type { DispatchHandler } from '../../../types';
import { GuildAuditLogEntry } from '../../structures';

export const guildAuditLogEntryCreate: DispatchHandler<'GUILD_AUDIT_LOG_ENTRY_CREATE'> = (client, data) => {
    client.emit('guildAuditLogEntryCreate', new GuildAuditLogEntry(client, data, data.guild_id));
};
