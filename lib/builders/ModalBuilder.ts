/* eslint-disable @typescript-eslint/naming-convention */

import { type TextInputStyle, type APIActionRowComponent, ComponentType, type APIModalInteractionResponseCallbackData, type APIComponentInModalActionRow } from 'discord-api-types/v10';

/**
 * Allows you to easily build modals
 *
 * @export
 * @class ModalBuilder
 */
export default class ModalBuilder {
  /**
   * Label for this component; max 45 characters
   *
   * @type {string}
   * @memberof ModalBuilder
   */
  title: string;
  /**
   * Developer-defined identifier for the input; max 100 characters
   *
   * @type {string}
   * @memberof ModalBuilder
   */
  custom_id: string;
  /**
   * The components of the modal
   *
   * @type {Array<APIActionRowComponent<APIActionRowComponentTypes>>}
   * @memberof ModalBuilder
   */
  components: Array<APIActionRowComponent<APIComponentInModalActionRow>> = [];

  constructor(title: string, custom_id: string) {
    if (title.length > 45) throw new TypeError('Title cannot be greater than 45 characters');
    if (custom_id.length > 100) throw new TypeError('Custom id cannot be greater than 100 characters');
    this.title = title;
    this.custom_id = custom_id;
  }
  /**
   * Adds a TextInput component to the modal
   *
   * @param {{ custom_id: string; style: TextInputStyle; label: string; min_length?: number; max_length?: number; required?: boolean; value?: string; placeholder?: string }} { custom_id, style, label, min_length, max_length, required, value, placeholder }
   * @return {ModalBuilder}
   * @memberof ModalBuilder
   */
  addTextInput({ custom_id, style, label, min_length, max_length, required, value, placeholder }: { custom_id: string; style: TextInputStyle; label: string; min_length?: number; max_length?: number; required?: boolean; value?: string; placeholder?: string }) {
    if (this.components.length >= 5) throw new TypeError("Modals can't have more than 5 components");
    const row: APIActionRowComponent<APIComponentInModalActionRow> = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.TextInput,
          custom_id,
          style,
          label,
          min_length,
          max_length,
          required,
          value,
          placeholder
        }
      ]
    };

    this.components.push(row);

    return this;
  }

  toJSON(): APIModalInteractionResponseCallbackData {
    return {
      custom_id: this.custom_id,
      title: this.title,
      components: this.components
    };
  }
}
