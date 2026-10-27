import { BuilderLimits, ComponentTypes } from '../../constants';
import type { APIContainerChildRequest, APIUnfurledMediaRequest, FileData, SeparatorData } from '../../types';
import { ActionRowBuilder } from './actionRow';
import { MediaGalleryBuilder } from './mediaGallery';
import { SectionBuilder } from './section';

/**
 * The components shared by a {@link ContainerBuilder} and a Components V2 message. Builders whose callback adds nothing
 * are left out.
 */
export abstract class ComponentGroupBuilder<Extra = never> {
    readonly #prefix: string | null;
    readonly #components: Array<APIContainerChildRequest | Extra> = [];
    #size = 0;

    constructor(prefix: string | null) {
        this.#prefix = prefix;
    }

    /** How many components have been added, nested ones included. */
    get size(): number {
        return this.#size;
    }

    addActionRow(callback?: (builder: ActionRowBuilder) => void): this {
        const builder = new ActionRowBuilder(this.#prefix);
        callback?.(builder);
        if (builder.size > 0) this.append(builder.toJSON(), builder.size);
        return this;
    }

    addTextDisplay(content: string, id?: number): this {
        this.append({ type: ComponentTypes.TextDisplay, content, id }, 1);
        return this;
    }

    addSeparator(options: SeparatorData = {}): this {
        this.append({ type: ComponentTypes.Separator, ...options }, 1);
        return this;
    }

    /** `file` must point at an uploaded file, as `attachment://<name>`. */
    addFile(file: APIUnfurledMediaRequest, options: FileData = {}): this {
        this.append({ type: ComponentTypes.File, file, ...options }, 1);
        return this;
    }

    addSection(callback?: (builder: SectionBuilder) => void): this {
        const builder = new SectionBuilder(this.#prefix);
        callback?.(builder);
        if (builder.size > 0) this.append(builder.toJSON(), builder.size);
        return this;
    }

    addMediaGallery(callback?: (builder: MediaGalleryBuilder) => void): this {
        const builder = new MediaGalleryBuilder();
        callback?.(builder);
        if (builder.size > 0) this.append(builder.toJSON(), builder.size);
        return this;
    }

    protected get prefix(): string | null {
        return this.#prefix;
    }

    protected get components(): Array<APIContainerChildRequest | Extra> {
        return [...this.#components];
    }

    protected append(component: APIContainerChildRequest | Extra, size: number): void {
        if (this.#size + size > BuilderLimits.MessageComponents) throw new TypeError(`A message can't have more than ${BuilderLimits.MessageComponents} components`);
        this.#components.push(component);
        this.#size += size;
    }
}
