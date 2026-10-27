import type { APIGuildEmoji, APIGuildPreview, APISticker, ClientContext } from '../../types';
import { Base } from './base';
import { Emoji } from './emoji';
import { Sticker } from './sticker';

/** What anyone can see of a discoverable guild, or of a guild the client is in, without joining it. */
export class GuildPreview extends Base {
    readonly name: string;
    readonly icon: string | null;
    readonly splash: string | null;
    readonly discoverySplash: string | null;
    readonly description: string | null;
    readonly features: string[];
    readonly approximateMemberCount: number;
    readonly approximatePresenceCount: number;
    readonly emojis: Emoji[];
    readonly stickers: Sticker[];

    constructor(client: ClientContext, data: APIGuildPreview) {
        super(client, data.id);
        this.name = data.name;
        this.icon = data.icon;
        this.splash = data.splash;
        this.discoverySplash = data.discovery_splash;
        this.description = data.description;
        this.features = data.features;
        this.approximateMemberCount = data.approximate_member_count;
        this.approximatePresenceCount = data.approximate_presence_count;
        this.emojis = data.emojis.map((emoji) => new Emoji(client, emoji as APIGuildEmoji, data.id));
        this.stickers = data.stickers.map((sticker) => new Sticker(client, { ...(sticker as APISticker), guild_id: data.id }));
    }
}
