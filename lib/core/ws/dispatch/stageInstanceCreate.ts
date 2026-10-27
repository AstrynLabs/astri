import type { DispatchHandler } from '../../../types';
import { upsertStageInstance } from '../../structures';

export const stageInstanceCreate: DispatchHandler<'STAGE_INSTANCE_CREATE'> = (client, data) => {
    client.emit('stageInstanceCreate', upsertStageInstance(client, data));
};
