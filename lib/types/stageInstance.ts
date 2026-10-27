import type { RESTBody } from './rest';

/** Changes to a stage instance. Fields left out are kept. */
export type StageInstanceEditData = RESTBody<'/stage-instances/{channel_id}', 'patch'>;

/** A new stage in a stage channel. `send_start_notification` pings members, and needs the mention everyone permission. */
export type StageInstanceCreateData = Omit<RESTBody<'/stage-instances', 'post'>, 'channel_id'>;
