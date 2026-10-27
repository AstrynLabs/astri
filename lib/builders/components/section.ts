import { BuilderLimits, ComponentTypes } from '../../constants';
import type { APISectionAccessoryRequest, APISectionRequest, APITextDisplayRequest, APIUnfurledMediaRequest, NormalButtonData, PremiumButtonData, ThumbnailData, URLButtonData } from '../../types';
import { toNormalButton, toPremiumButton, toURLButton } from '../util';

/** Builds a section: up to three text displays with a button or thumbnail beside them. An accessory is required. */
export class SectionBuilder {
    readonly #prefix: string | null;
    readonly #components: APITextDisplayRequest[] = [];
    #accessory: APISectionAccessoryRequest | null = null;
    #id: number | undefined;

    /** `prefix` is prepended to the accessory button's `custom_id` as `<prefix>:<custom_id>`. */
    constructor(prefix: string | null = null) {
        this.#prefix = prefix;
    }

    /** How many components the section counts for in a message, itself and its accessory included. `0` while it has no text. */
    get size(): number {
        return this.#components.length === 0 ? 0 : this.#components.length + 2;
    }

    /** Optional. Discord numbers components without one. */
    setID(id: number): this {
        this.#id = id;
        return this;
    }

    addTextDisplay(content: string, id?: number): this {
        if (this.#components.length >= BuilderLimits.SectionTextDisplays) throw new TypeError(`A section can't have more than ${BuilderLimits.SectionTextDisplays} text displays`);
        this.#components.push({ type: ComponentTypes.TextDisplay, content, id });
        return this;
    }

    setAccessoryAsNormalButton(data: NormalButtonData): this {
        this.#accessory = toNormalButton(data, this.#prefix);
        return this;
    }

    setAccessoryAsURLButton(data: URLButtonData): this {
        this.#accessory = toURLButton(data);
        return this;
    }

    setAccessoryAsPremiumButton(data: PremiumButtonData): this {
        this.#accessory = toPremiumButton(data);
        return this;
    }

    setAccessoryAsThumbnail(media: APIUnfurledMediaRequest, options: ThumbnailData = {}): this {
        this.#accessory = { type: ComponentTypes.Thumbnail, media, ...options };
        return this;
    }

    /** Throws when no accessory has been set. */
    toJSON(): APISectionRequest {
        if (this.#accessory === null) throw new TypeError('A section needs an accessory');
        return { type: ComponentTypes.Section, id: this.#id, components: [...this.#components], accessory: this.#accessory };
    }
}
