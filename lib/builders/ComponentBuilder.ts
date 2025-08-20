/* eslint-disable @typescript-eslint/naming-convention */
import { ComponentType, type APIComponentInMessageActionRow, ButtonStyle, type APIMessageComponentEmoji, type APISelectMenuOption, type APIActionRowComponent, type ChannelType, SelectMenuDefaultValueType } from 'discord-api-types/v10';
import ActionRow from './components/ActionRow';

/**
 * Allows you to easily build components, build your components then when your done convert it to api friendly json with toJSON()
 *
 * @export
 * @class ComponentBuilder
 */
export default class ComponentBuilder {
  private readonly _components: Array<APIActionRowComponent<APIComponentInMessageActionRow>> = [];
  private readonly _prefix: string | null;

  /**
   * Creates an instance of ComponentBuilder.
   * @param {(string | null)} [prefix=null] Optional prefix for all custom ids if your using CommandClient you can pass in your command id here
   * @memberof ComponentBuilder
   */
  constructor(prefix: string | null = null) {
    this._prefix = prefix;
  }
  /**
   * Adds an action row to the Component Builder
   *
   * @param {(builder: ActionRowBuilder) => void} [callback]
   * @return {ComponentBuilder}
   * @memberof ComponentBuilder
   */
  addActionRow(callback?: (builder: ActionRow) => void) {
    if (this._components.length >= 5) throw new TypeError("Messages can't have more than 5 action rows");
    const builder = new ActionRow(this._prefix);
    callback?.(builder);
    if (builder.size > 0) this._components.push(builder.toJSON());
    return this;
  }

  /**
   * Converts the Component Builder to api friendly plain object
   *
   * @return {Array<APIActionRowComponent<APIMessageActionRowComponent>>}
   * @memberof ComponentBuilder
   */
  toJSON(): Array<APIActionRowComponent<APIComponentInMessageActionRow>> {
    return this._components;
  }
}
