import type { DispatchHandler } from '../../../types';
import { StageInstance } from '../../structures';

export const stageInstanceDelete: DispatchHandler<'STAGE_INSTANCE_DELETE'> = (client, data) => {
    const stageInstances = client.guilds.get(data.guild_id)?.stageInstances;
    const stageInstance = stageInstances?.get(data.id);
    stageInstances?.delete(data.id);
    stageInstance?.patch(data);
    client.emit('stageInstanceDelete', stageInstance ?? new StageInstance(client, data));
};
