import type { DispatchHandler } from '../../../types';
import { upsertSoundboardSound } from '../../structures';

export const guildSoundboardSoundCreate: DispatchHandler<'GUILD_SOUNDBOARD_SOUND_CREATE'> = (client, data) => {
    client.emit('guildSoundboardSoundCreate', upsertSoundboardSound(client, data, data.guild_id));
};
