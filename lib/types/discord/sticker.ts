import type { StickerFormatTypes, StickerTypes } from '../../constants';
import type { components } from './openapi';
import type { APIUser } from './user';

/** A guild sticker or one from an official pack. Which optional fields are present depends on `type`. */
export interface APISticker {
    id: string;
    name: string;
    description: string | null;
    /** Autocomplete keywords, comma separated. */
    tags: string;
    type: StickerTypes;
    format_type: StickerFormatTypes | null;
    /** Guild stickers only. `false` once the guild lost the boosts it needed. */
    available?: boolean;
    /** Guild stickers only. */
    guild_id?: string;
    /** Guild stickers only: who uploaded it. Only present with the manage expressions permission. */
    user?: APIUser;
    /** Standard stickers only. */
    pack_id?: string;
    /** Standard stickers only: where it is in its pack. */
    sort_value?: number;
}

export type APIStickerPack = components['schemas']['StickerPackResponse'];
