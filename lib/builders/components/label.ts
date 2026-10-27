import { ComponentTypes } from '../../constants';
import type { APILabelChildRequest, APILabelRequest, CheckboxData, CheckboxGroupData, FileUploadData, LabelTextInputData, ModalChannelSelectData, ModalMentionableSelectData, ModalRoleSelectData, ModalStringSelectData, ModalUserSelectData, RadioGroupData } from '../../types';
import { toDefaultValues } from '../util';

/** Builds a label: a title and optional description around a single modal input. Setting an input replaces the previous one. */
export class LabelBuilder {
    readonly #label: string;
    readonly #description: string | undefined;
    #component: APILabelChildRequest | null = null;
    #id: number | undefined;

    constructor(label: string, description?: string) {
        this.#label = label;
        this.#description = description;
    }

    /** Optional. Discord numbers components without one. */
    setID(id: number): this {
        this.#id = id;
        return this;
    }

    setTextInput(data: LabelTextInputData): this {
        return this.#set({ type: ComponentTypes.TextInput, ...data });
    }

    setStringSelect(data: ModalStringSelectData): this {
        return this.#set({ type: ComponentTypes.StringSelect, ...data });
    }

    setChannelSelect({ default_values, ...data }: ModalChannelSelectData): this {
        return this.#set({ type: ComponentTypes.ChannelSelect, ...data, default_values: toDefaultValues(default_values, 'channel') });
    }

    setRoleSelect({ default_values, ...data }: ModalRoleSelectData): this {
        return this.#set({ type: ComponentTypes.RoleSelect, ...data, default_values: toDefaultValues(default_values, 'role') });
    }

    setUserSelect({ default_values, ...data }: ModalUserSelectData): this {
        return this.#set({ type: ComponentTypes.UserSelect, ...data, default_values: toDefaultValues(default_values, 'user') });
    }

    setMentionableSelect(data: ModalMentionableSelectData): this {
        return this.#set({ type: ComponentTypes.MentionableSelect, ...data });
    }

    setFileUpload(data: FileUploadData): this {
        return this.#set({ type: ComponentTypes.FileUpload, ...data });
    }

    setRadioGroup(data: RadioGroupData): this {
        return this.#set({ type: ComponentTypes.RadioGroup, ...data });
    }

    setCheckboxGroup(data: CheckboxGroupData): this {
        return this.#set({ type: ComponentTypes.CheckboxGroup, ...data });
    }

    setCheckbox(data: CheckboxData): this {
        return this.#set({ type: ComponentTypes.Checkbox, ...data });
    }

    /** Throws when no input has been set. */
    toJSON(): APILabelRequest {
        if (this.#component === null) throw new TypeError('A label needs an input');
        return { type: ComponentTypes.Label, id: this.#id, label: this.#label, description: this.#description, component: this.#component };
    }

    #set(component: APILabelChildRequest): this {
        this.#component = component;
        return this;
    }
}
