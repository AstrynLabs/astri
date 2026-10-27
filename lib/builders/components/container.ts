import { ComponentTypes } from '../../constants';
import type { APIContainerRequest } from '../../types';
import { ComponentGroupBuilder } from './group';

/** Builds a container: a box around other components, with an optional accent color. */
export class ContainerBuilder extends ComponentGroupBuilder {
    readonly #options: Pick<APIContainerRequest, 'id' | 'accent_color' | 'spoiler'> = {};

    /** `prefix` is prepended to every `custom_id` as `<prefix>:<custom_id>`. */
    constructor(prefix: string | null = null) {
        super(prefix);
    }

    /** How many components the container counts for in a message, itself included. `0` while it is empty. */
    override get size(): number {
        return super.size === 0 ? 0 : super.size + 1;
    }

    /** Optional. Discord numbers components without one. */
    setID(id: number): this {
        this.#options.id = id;
        return this;
    }

    /** An RGB color, e.g. `0x5865f2`. No accent when left out. */
    setAccentColor(color: number): this {
        this.#options.accent_color = color;
        return this;
    }

    /** Default: `false`. */
    setSpoiler(spoiler: boolean): this {
        this.#options.spoiler = spoiler;
        return this;
    }

    toJSON(): APIContainerRequest {
        return { type: ComponentTypes.Container, ...this.#options, components: this.components };
    }
}
