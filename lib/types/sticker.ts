import type { RESTBody, RESTFile } from './rest';

/** Changes to a guild sticker. Fields left out are kept. */
export type StickerEditData = RESTBody<'/guilds/{guild_id}/stickers/{sticker_id}', 'patch'>;

/** A new guild sticker. `file` is a PNG, APNG, GIF or Lottie JSON of at most 512 KiB. */
export interface StickerCreateData extends Omit<RESTBody<'/guilds/{guild_id}/stickers', 'post'>, 'file'> {
    file: RESTFile;
}
