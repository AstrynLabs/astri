import type { DispatchHandler } from '../../../types';
import { createInteraction } from '../../structures';

export const interactionCreate: DispatchHandler<'INTERACTION_CREATE'> = (client, data) => {
    client.emit('interactionCreate', createInteraction(client, data));
};
