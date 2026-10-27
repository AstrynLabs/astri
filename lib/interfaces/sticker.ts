import type { Sticker } from '../core/structures';

/** An official pack of standard stickers. */
export interface StickerPack {
    id: string;
    /** The SKU the pack is sold as. */
    skuId: string;
    name: string;
    description: string | null;
    stickers: Sticker[];
    /** The sticker shown as the pack's icon. */
    coverStickerId: string | null;
    /** Asset id of the pack's banner image. */
    bannerAssetId: string | null;
}
