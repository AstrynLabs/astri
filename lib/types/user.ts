import type { RESTBody, RESTQuery } from './rest';

/** Changes to the client's own user. `avatar` and `banner` are data URIs, or `null` to remove them. */
export type CurrentUserEditData = RESTBody<'/users/@me', 'patch'>;

/** Which of the client's guilds to list, in id order, paged with `before` or `after`. `limit` is 1-200, 200 by default. */
export type CurrentUserGuildFetchOptions = RESTQuery<'/users/@me/guilds', 'get'>;
