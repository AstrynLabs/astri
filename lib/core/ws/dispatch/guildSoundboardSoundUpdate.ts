import type { DispatchHandler } from '../../../types';
import { upsertSoundboardSound } from '../../structures';

export const guildSoundboardSoundUpdate: DispatchHandler<'GUILD_SOUNDBOARD_SOUND_UPDATE'> = (client, data) => {
    const old = client.guilds.get(data.guild_id)?.soundboardSounds.get(data.sound_id)?.clone() ?? null;
    client.emit('guildSoundboardSoundUpdate', upsertSoundboardSound(client, data, data.guild_id), old);
};
