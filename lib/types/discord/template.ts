import type { components } from './openapi';

export type APIGuildTemplate = components['schemas']['GuildTemplateResponse'];

/** The guild a template was made from, as the raw API shape. */
export type APIGuildTemplateSnapshot = components['schemas']['GuildTemplateSnapshotResponse'];
