import type { RESTBody } from './rest';

/** Changes to a stage instance. Fields left out are kept. */
export type StageInstanceEditData = RESTBody<'/stage-instances/{channel_id}', 'patch'>;
