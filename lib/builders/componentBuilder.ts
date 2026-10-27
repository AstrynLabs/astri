import { BuilderLimits } from '../constants';
import type { APIActionRowRequest } from '../types';
import { ActionRowBuilder } from './components';

/** Builds the action rows of a message without Components V2. Pass {@link ComponentBuilder.toJSON} as `components`. */
export class ComponentBuilder {
    readonly #prefix: string | null;
    readonly #rows: APIActionRowRequest[] = [];

    /** `prefix` is prepended to every `custom_id` as `<prefix>:<custom_id>`. */
    constructor(prefix: string | null = null) {
        this.#prefix = prefix;
    }

    /** Left out when `callback` adds nothing. */
    addActionRow(callback?: (builder: ActionRowBuilder) => void): this {
        if (this.#rows.length >= BuilderLimits.ActionRows) throw new TypeError(`A message can't have more than ${BuilderLimits.ActionRows} action rows`);
        const builder = new ActionRowBuilder(this.#prefix);
        callback?.(builder);
        if (builder.size > 0) this.#rows.push(builder.toJSON());
        return this;
    }

    toJSON(): APIActionRowRequest[] {
        return [...this.#rows];
    }
}
