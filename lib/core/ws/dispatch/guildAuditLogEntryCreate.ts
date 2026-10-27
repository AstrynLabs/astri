import type { DispatchHandler } from '../../../types';
import { toAuditLogEntry } from '../../structures/util';

export const guildAuditLogEntryCreate: DispatchHandler<'GUILD_AUDIT_LOG_ENTRY_CREATE'> = (client, data) => {
    client.emit('guildAuditLogEntryCreate', toAuditLogEntry(data));
};
