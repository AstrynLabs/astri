import { BuilderLimits, ComponentTypes } from '../constants';
import type { APIModalComponentRequest, InteractionModalData, TextInputData } from '../types';
import { LabelBuilder } from './components';

/** Builds a modal to pass to `showModal`. A modal holds at most 5 labels, text displays and text input rows. */
export class ModalBuilder {
    readonly #title: string;
    readonly #customId: string;
    readonly #components: APIModalComponentRequest[] = [];

    /** `title` is at most 45 characters and `customId` at most 100. */
    constructor(title: string, customId: string) {
        if (title.length > BuilderLimits.ModalTitleLength) throw new TypeError(`A modal title can't be longer than ${BuilderLimits.ModalTitleLength} characters`);
        if (customId.length > BuilderLimits.CustomIdLength) throw new TypeError(`A custom id can't be longer than ${BuilderLimits.CustomIdLength} characters`);
        this.#title = title;
        this.#customId = customId;
    }

    /** Adds an input with a title and optional description above it. `callback` must set the input. */
    addLabel(label: string, description: string | undefined, callback: (builder: LabelBuilder) => void): this {
        const builder = new LabelBuilder(label, description);
        callback(builder);
        return this.#add(builder.toJSON());
    }

    /** Adds markdown text, for instructions or context between inputs. */
    addTextDisplay(content: string, id?: number): this {
        return this.#add({ type: ComponentTypes.TextDisplay, content, id });
    }

    /** Adds a text input on its own action row. Discord prefers a text input in a label, via {@link ModalBuilder.addLabel}. */
    addTextInput(data: TextInputData): this {
        return this.#add({ type: ComponentTypes.ActionRow, components: [{ type: ComponentTypes.TextInput, ...data }] });
    }

    toJSON(): InteractionModalData {
        return { custom_id: this.#customId, title: this.#title, components: [...this.#components] };
    }

    #add(component: APIModalComponentRequest): this {
        if (this.#components.length >= BuilderLimits.ModalComponents) throw new TypeError(`A modal can't have more than ${BuilderLimits.ModalComponents} components`);
        this.#components.push(component);
        return this;
    }
}
