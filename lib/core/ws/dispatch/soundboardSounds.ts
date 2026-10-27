import type { DispatchHandler } from '../../../types';
import { SoundboardSound } from '../../structures';

export const soundboardSounds: DispatchHandler<'SOUNDBOARD_SOUNDS'> = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    if (guild === undefined) {
        const sounds = data.soundboard_sounds.map((sound) => new SoundboardSound(client, { ...sound, guild_id: data.guild_id }));
        client.emit('soundboardSounds', data.guild_id, sounds);
        return;
    }

    guild.patch({ soundboard_sounds: data.soundboard_sounds });
    const sounds = data.soundboard_sounds.map((sound) => guild.soundboardSounds.peek(sound.sound_id) ?? new SoundboardSound(client, { ...sound, guild_id: data.guild_id }));
    client.emit('soundboardSounds', data.guild_id, sounds);
};
