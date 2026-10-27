import type { RESTBody } from './rest';

/** Changes to a guild sticker. Fields left out are kept. */
export type StickerEditData = RESTBody<'/guilds/{guild_id}/stickers/{sticker_id}', 'patch'>;
