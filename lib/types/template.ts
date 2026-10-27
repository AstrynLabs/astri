import type { RESTBody } from './rest';

/** A new template of a guild. */
export type TemplateCreateData = RESTBody<'/guilds/{guild_id}/templates', 'post'>;

/** Changes to a template's name or description. Fields left out are kept. */
export type TemplateEditData = RESTBody<'/guilds/{guild_id}/templates/{code}', 'patch'>;
