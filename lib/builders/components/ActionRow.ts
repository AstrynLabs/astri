import { APIActionRowComponent, APIComponentInMessageActionRow, APIMessageComponentEmoji, APISelectMenuOption, ButtonStyle, ChannelType, ComponentType, SelectMenuDefaultValueType } from 'discord-api-types/v10';
import { Buildable, ComponentBuilderBuildable } from '../../interfaces/Buildable';

export default class ActionRow implements Buildable<ComponentBuilderBuildable<APIActionRowComponent<APIComponentInMessageActionRow>>> {
  private readonly _components: APIComponentInMessageActionRow[] = [];
  private isButtonRow: boolean = false;
  private isSelectRow: boolean = false;
  private readonly _prefix: string | null;

  /**
   * Creates an instance of ActionRowBuilder.
   * @param {(string | null)} [prefix=null]
   * @memberof ActionRowBuilder
   */
  constructor(prefix: string | null = null) {
    this._prefix = prefix;
  }
  /**
   * The number of components in this action row
   *
   * @readonly
   * @memberof ActionRowBuilder
   */
  get size() {
    return this._components.length;
  }

  /**
   * Adds a normal button to the action row
   *
   * @param {({ style: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger; label?: string; emoji?: APIMessageComponentEmoji; custom_id: string; disabled?: boolean })} { style, label, emoji, custom_id, disabled }
   * @return {*}
   * @memberof ActionRowBuilder
   */
  addNormalButton({ style, label, emoji, custom_id, disabled }: { style: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger; label?: string; emoji?: string | APIMessageComponentEmoji; custom_id: string; disabled?: boolean }) {
    this.validation(true);
    if (!this.isButtonRow) this.isButtonRow = true;
    if (typeof emoji === 'string') emoji = this.formatEmoji(emoji);
    this._components.push({
      type: ComponentType.Button,
      style,
      label,
      emoji,
      custom_id: this._prefix ? `${this._prefix}:${custom_id}` : custom_id,
      disabled
    });
    return this;
  }

  /**
   * Adds a link button to the action row
   *
   * @param {{ label: string; url: string; disabled?: boolean }} { label, url, disabled }
   * @return {*}
   * @memberof ActionRowBuilder
   */
  addURLButton({ label, url, disabled }: { label: string; url: string; disabled?: boolean }) {
    this.validation(true);
    if (!this.isButtonRow) this.isButtonRow = true;
    this._components.push({
      type: ComponentType.Button,
      style: ButtonStyle.Link,
      label,
      url,
      disabled
    });
    return this;
  }

  /**
   * Adds a Premium Button to the action row
   *
   * @param {{ disabled?: boolean; sku_id: string }} { sku_id, disabled }
   * @return {*}
   * @memberof ActionRowBuilder
   */
  addPremiumButton({ disabled, sku_id }: { disabled?: boolean; sku_id: string }) {
    this.validation(true);
    if (!this.isButtonRow) this.isButtonRow = true;
    this._components.push({
      type: ComponentType.Button,
      style: ButtonStyle.Premium,
      sku_id,
      disabled
    });
    return this;
  }

  /**
   * Adds a select menu to the action row with the provided options
   *
   * @param {{ custom_id: string; placeholder?: string; min_values?: number; max_values?: number; options: APISelectMenuOption[]; disabled?: boolean }} { custom_id, placeholder, min_values, max_values, options, disabled }
   * @return {*}
   * @memberof ActionRowBuilder
   */
  addStringSelect({ custom_id, placeholder, min_values, max_values, options, disabled }: { custom_id: string; placeholder?: string; min_values?: number; max_values?: number; options: APISelectMenuOption[]; disabled?: boolean }) {
    this.validation(false);
    if (!this.isSelectRow) this.isSelectRow = true;
    this._components.push({
      type: ComponentType.StringSelect,
      custom_id: this._prefix ? `${this._prefix}:${custom_id}` : custom_id,
      placeholder,
      min_values,
      max_values,
      options,
      disabled
    });
    return this;
  }

  /**
   * Adds a select menu to the action row where a user can select channels
   *
   * @param {{ custom_id: string; placeholder?: string; min_values?: number; max_values?: number; disabled?: boolean; channel_types?: ChannelType[]; default_values?: string[] }} { custom_id, placeholder, min_values, max_values, disabled, channel_types, default_values }
   * @return {*}
   * @memberof ActionRowBuilder
   */
  addChannelSelect({ custom_id, placeholder, min_values, max_values, disabled, channel_types, default_values }: { custom_id: string; placeholder?: string; min_values?: number; max_values?: number; disabled?: boolean; channel_types?: ChannelType[]; default_values?: string[] }) {
    this.validation(false);
    if (!this.isSelectRow) this.isSelectRow = true;
    this._components.push({
      type: ComponentType.ChannelSelect,
      custom_id: this._prefix ? `${this._prefix}:${custom_id}` : custom_id,
      placeholder,
      min_values,
      max_values,
      disabled,
      channel_types,
      default_values: default_values?.length
        ? default_values.map((v) => {
            return { id: v, type: SelectMenuDefaultValueType.Channel };
          })
        : undefined
    });
    return this;
  }

  /**
   * Adds a select menu to the action row where a user can select roles
   *
   * @param {{ custom_id: string; placeholder?: string; min_values?: number; max_values?: number; disabled?: boolean; default_values?: string[] }} { custom_id, placeholder, min_values, max_values, disabled, default_values }
   * @return {*}
   * @memberof ActionRowBuilder
   */
  addRoleSelect({ custom_id, placeholder, min_values, max_values, disabled, default_values }: { custom_id: string; placeholder?: string; min_values?: number; max_values?: number; disabled?: boolean; default_values?: string[] }) {
    this.validation(false);
    if (!this.isSelectRow) this.isSelectRow = true;
    this._components.push({
      type: ComponentType.RoleSelect,
      custom_id: this._prefix ? `${this._prefix}:${custom_id}` : custom_id,
      placeholder,
      min_values,
      max_values,
      disabled,
      default_values: default_values?.length
        ? default_values.map((v) => {
            return { id: v, type: SelectMenuDefaultValueType.Role };
          })
        : undefined
    });
    return this;
  }

  /**
   * Adds a select menu to the action row where a user can select users
   *
   * @param {{ custom_id: string; placeholder?: string; min_values?: number; max_values?: number; disabled?: boolean; default_values?: string[] }} { custom_id, placeholder, min_values, max_values, disabled, default_values }
   * @return {*}
   * @memberof ActionRowBuilder
   */
  addUserSelect({ custom_id, placeholder, min_values, max_values, disabled, default_values }: { custom_id: string; placeholder?: string; min_values?: number; max_values?: number; disabled?: boolean; default_values?: string[] }) {
    this.validation(false);
    if (!this.isSelectRow) this.isSelectRow = true;
    this._components.push({
      type: ComponentType.UserSelect,
      custom_id: this._prefix ? `${this._prefix}:${custom_id}` : custom_id,
      placeholder,
      min_values,
      max_values,
      disabled,
      default_values: default_values?.length
        ? default_values.map((v) => {
            return { id: v, type: SelectMenuDefaultValueType.User };
          })
        : undefined
    });
    return this;
  }

  /**
   * Adds a select menu to the action row where a user can select any mentionable object
   *
   * @param {{ custom_id: string; placeholder?: string; min_values?: number; max_values?: number; disabled?: boolean }} { custom_id, placeholder, min_values, max_values, disabled }
   * @return {*}
   * @memberof ActionRowBuilder
   */
  addMentionableSelect({ custom_id, placeholder, min_values, max_values, disabled }: { custom_id: string; placeholder?: string; min_values?: number; max_values?: number; disabled?: boolean }) {
    this.validation(false);
    if (!this.isSelectRow) this.isSelectRow = true;
    this._components.push({
      type: ComponentType.MentionableSelect,
      custom_id: this._prefix ? `${this._prefix}:${custom_id}` : custom_id,
      placeholder,
      min_values,
      max_values,
      disabled
    });
    return this;
  }

  private validation(isButton: boolean) {
    if (this.isButtonRow || this.isSelectRow) {
      if ((isButton && this.isSelectRow) || (!isButton && this.isButtonRow)) throw new TypeError("Messages can't have both buttons and selects in the same action row");
    }
    if (this.isSelectRow && this._components.length > 0) throw new TypeError("An Action Row can't have more than 1 select component");
    if (this._components.length >= 5) throw new TypeError("An Action Row can't have more than 5 components");
  }

  /**
   * Converts the Action Row Builder to api friendly plain object
   * Here for backwards compatibility with the old ComponentBuilder
   *
   * @return {*}  {APIActionRowComponent<APIMessageActionRowComponent>}
   * @memberof ActionRowBuilder
   */
  toJSON(): APIActionRowComponent<APIComponentInMessageActionRow> {
    return this.build().built;
  }

  /**
   * Converts a string emoji to a APIMessageComponentEmoji
   *
   * @return {APIMessageComponentEmoji}  {APIMessageComponentEmoji}
   * @memberof ActionRowBuilder
   */
  private formatEmoji(emoji: string): APIMessageComponentEmoji {
    const cleaned = emoji.replace(/(<:)|(<)|(>)/g, '');
    const split = cleaned.split(':');

    let animated = false;
    if (split.length === 3) {
      animated = true;
      split.shift();
    }

    return {
      animated,
      name: split[0],
      id: split[1] ?? undefined
    };
  }

  build(): ComponentBuilderBuildable<APIActionRowComponent<APIComponentInMessageActionRow>> {
    return {
      size: this._components.length,
      built: {
        type: ComponentType.ActionRow,
        components: this._components
      }
    };
  }
}
