import type { DispatchHandler } from '../../../types';
import { Sticker } from '../../structures';

export const guildStickersUpdate: DispatchHandler<'GUILD_STICKERS_UPDATE'> = (client, data) => {
    const guild = client.guilds.get(data.guild_id);
    if (guild === undefined) {
        const stickers = data.stickers.map((sticker) => new Sticker(client, sticker));
        client.emit('guildStickersUpdate', data.guild_id, stickers, null);
        return;
    }

    const old = guild.stickers.map((sticker) => sticker.clone());
    guild.patch({ stickers: data.stickers });
    const stickers = data.stickers.map((sticker) => guild.stickers.peek(sticker.id) ?? new Sticker(client, sticker));
    client.emit('guildStickersUpdate', data.guild_id, stickers, old);
};
