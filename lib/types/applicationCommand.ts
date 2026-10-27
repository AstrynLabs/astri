import type { RESTBody, RESTQuery } from './rest';

/** A new global command. Creating one with the name of an existing command of the same type overwrites it. */
export type ApplicationCommandCreateData = RESTBody<'/applications/{application_id}/commands', 'post'>;

/** A new guild command. Creating one with the name of an existing command of the same type overwrites it. */
export type GuildApplicationCommandCreateData = RESTBody<'/applications/{application_id}/guilds/{guild_id}/commands', 'post'>;

/** Changes to a command. Fields left out are kept. */
export type ApplicationCommandEditData = RESTBody<'/applications/{application_id}/commands/{command_id}', 'patch'>;

/** The full list of global commands. Commands missing from it are deleted. */
export type ApplicationCommandBulkData = RESTBody<'/applications/{application_id}/commands', 'put'>;

/** The full list of a guild's commands. Commands missing from it are deleted. */
export type GuildApplicationCommandBulkData = RESTBody<'/applications/{application_id}/guilds/{guild_id}/commands', 'put'>;

/** `with_localizations` includes every locale in `nameLocalizations` and `descriptionLocalizations`. */
export type ApplicationCommandFetchOptions = RESTQuery<'/applications/{application_id}/commands', 'get'>;
