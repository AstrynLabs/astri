import type { DispatchHandler } from '../../../types';
import { upsertSoundboardSound } from '../../structures';

export const guildSoundboardSoundsUpdate: DispatchHandler<'GUILD_SOUNDBOARD_SOUNDS_UPDATE'> = (client, data) => {
    const sounds = data.soundboard_sounds.map((sound) => upsertSoundboardSound(client, sound, data.guild_id));
    client.emit('guildSoundboardSoundsUpdate', data.guild_id, sounds);
};
