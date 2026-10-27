import type { RESTBody } from './rest';

/** Changes to a voice state in a stage channel. Fields left out are kept. */
export type VoiceStateEditData = RESTBody<'/guilds/{guild_id}/voice-states/@me', 'patch'>;
