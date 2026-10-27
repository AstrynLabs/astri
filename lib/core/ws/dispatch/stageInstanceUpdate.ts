import type { DispatchHandler } from '../../../types';
import { upsertStageInstance } from '../../structures';

export const stageInstanceUpdate: DispatchHandler<'STAGE_INSTANCE_UPDATE'> = (client, data) => {
    const old = client.guilds.get(data.guild_id)?.stageInstances.get(data.id)?.clone() ?? null;
    client.emit('stageInstanceUpdate', upsertStageInstance(client, data), old);
};
