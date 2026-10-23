import type { DispatchHandler } from '../../../types';
import { Emoji } from '../../structures';

export const guildEmojisUpdate: DispatchHandler<'GUILD_EMOJIS_UPDATE'> = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    if (guild === undefined) {
        const emojis = data.emojis.map((emoji) => new Emoji(client, emoji, data.guild_id));
        client.emit('guildEmojisUpdate', data.guild_id, emojis, null);
        return;
    }

    const old = guild.emojis.map((emoji) => emoji.clone());
    guild.patch({ emojis: data.emojis });
    const emojis = data.emojis.map((emoji) => guild.emojis.peek(emoji.id) ?? new Emoji(client, emoji, data.guild_id));
    client.emit('guildEmojisUpdate', data.guild_id, emojis, old);
};
