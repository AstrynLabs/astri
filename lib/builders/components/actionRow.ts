import { BuilderLimits, ComponentTypes } from '../../constants';
import type { APIActionRowChildRequest, APIActionRowRequest, ChannelSelectData, MentionableSelectData, NormalButtonData, PremiumButtonData, RoleSelectData, StringSelectData, URLButtonData, UserSelectData } from '../../types';
import { toDefaultValues, toNormalButton, toPremiumButton, toURLButton, withPrefix } from '../util';

/** Builds an action row: up to five buttons, or a single select menu. */
export class ActionRowBuilder {
    readonly #prefix: string | null;
    readonly #components: APIActionRowChildRequest[] = [];
    #hasSelect = false;

    /** `prefix` is prepended to every `custom_id` as `<prefix>:<custom_id>`. */
    constructor(prefix: string | null = null) {
        this.#prefix = prefix;
    }

    /** How many components the row counts for in a message, the row itself included. `0` while it is empty. */
    get size(): number {
        return this.#components.length === 0 ? 0 : this.#components.length + 1;
    }

    addNormalButton(data: NormalButtonData): this {
        return this.#addButton(toNormalButton(data, this.#prefix));
    }

    addURLButton(data: URLButtonData): this {
        return this.#addButton(toURLButton(data));
    }

    addPremiumButton(data: PremiumButtonData): this {
        return this.#addButton(toPremiumButton(data));
    }

    addStringSelect(data: StringSelectData): this {
        return this.#addSelect({ type: ComponentTypes.StringSelect, ...data, custom_id: withPrefix(this.#prefix, data.custom_id) });
    }

    addChannelSelect({ default_values, ...data }: ChannelSelectData): this {
        return this.#addSelect({ type: ComponentTypes.ChannelSelect, ...data, custom_id: withPrefix(this.#prefix, data.custom_id), default_values: toDefaultValues(default_values, 'channel') });
    }

    addRoleSelect({ default_values, ...data }: RoleSelectData): this {
        return this.#addSelect({ type: ComponentTypes.RoleSelect, ...data, custom_id: withPrefix(this.#prefix, data.custom_id), default_values: toDefaultValues(default_values, 'role') });
    }

    addUserSelect({ default_values, ...data }: UserSelectData): this {
        return this.#addSelect({ type: ComponentTypes.UserSelect, ...data, custom_id: withPrefix(this.#prefix, data.custom_id), default_values: toDefaultValues(default_values, 'user') });
    }

    addMentionableSelect(data: MentionableSelectData): this {
        return this.#addSelect({ type: ComponentTypes.MentionableSelect, ...data, custom_id: withPrefix(this.#prefix, data.custom_id) });
    }

    toJSON(): APIActionRowRequest {
        return { type: ComponentTypes.ActionRow, components: [...this.#components] };
    }

    #addButton(button: APIActionRowChildRequest): this {
        if (this.#hasSelect) throw new TypeError("An action row can't have both buttons and a select menu");
        if (this.#components.length >= BuilderLimits.ActionRowButtons) throw new TypeError(`An action row can't have more than ${BuilderLimits.ActionRowButtons} buttons`);
        this.#components.push(button);
        return this;
    }

    #addSelect(select: APIActionRowChildRequest): this {
        if (this.#hasSelect) throw new TypeError("An action row can't have more than 1 select menu");
        if (this.#components.length > 0) throw new TypeError("An action row can't have both buttons and a select menu");
        this.#hasSelect = true;
        this.#components.push(select);
        return this;
    }
}
