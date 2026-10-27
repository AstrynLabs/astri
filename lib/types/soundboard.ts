import type { RESTBody } from './rest';

/** A new soundboard sound. `sound` is an MP3 or OGG data URI. */
export type SoundboardSoundCreateData = RESTBody<'/guilds/{guild_id}/soundboard-sounds', 'post'>;

/** Changes to a soundboard sound. Fields left out are kept. */
export type SoundboardSoundEditData = RESTBody<'/guilds/{guild_id}/soundboard-sounds/{sound_id}', 'patch'>;
