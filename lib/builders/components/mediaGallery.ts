import { BuilderLimits, ComponentTypes } from '../../constants';
import type { APIMediaGalleryItemRequest, APIMediaGalleryRequest } from '../../types';

/** Builds a media gallery of up to ten images or videos. */
export class MediaGalleryBuilder {
    readonly #items: APIMediaGalleryItemRequest[] = [];
    #id: number | undefined;

    /** How many components the gallery counts for in a message. `0` while it is empty. */
    get size(): number {
        return this.#items.length === 0 ? 0 : 1;
    }

    /** Optional. Discord numbers components without one. */
    setID(id: number): this {
        this.#id = id;
        return this;
    }

    addMediaItem(item: APIMediaGalleryItemRequest): this {
        if (this.#items.length >= BuilderLimits.MediaGalleryItems) throw new TypeError(`A media gallery can't have more than ${BuilderLimits.MediaGalleryItems} items`);
        this.#items.push(item);
        return this;
    }

    toJSON(): APIMediaGalleryRequest {
        return { type: ComponentTypes.MediaGallery, id: this.#id, items: [...this.#items] };
    }
}
