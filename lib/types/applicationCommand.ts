import type { RESTBody } from './rest';

/** Changes to a command. Fields left out are kept. */
export type ApplicationCommandEditData = RESTBody<'/applications/{application_id}/commands/{command_id}', 'patch'>;
