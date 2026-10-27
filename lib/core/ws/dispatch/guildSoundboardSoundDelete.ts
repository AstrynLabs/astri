import type { DispatchHandler } from '../../../types';

export const guildSoundboardSoundDelete: DispatchHandler<'GUILD_SOUNDBOARD_SOUND_DELETE'> = (client, data) => {
    const sounds = client.guilds.get(data.guild_id)?.soundboardSounds;
    const sound = sounds?.get(data.sound_id) ?? null;
    sounds?.delete(data.sound_id);
    client.emit('guildSoundboardSoundDelete', data.sound_id, data.guild_id, sound);
};
