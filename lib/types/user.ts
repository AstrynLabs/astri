import type { RESTBody } from './rest';

/** Changes to the client's own user. `avatar` and `banner` are data URIs, or `null` to remove them. */
export type CurrentUserEditData = RESTBody<'/users/@me', 'patch'>;
