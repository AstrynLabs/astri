import { APIInteractionResponseCallbackData, APIMessageTopLevelComponent, APIUnfurledMediaItem, MessageFlags, RESTPostAPIChannelMessageJSONBody, RESTPostAPIWebhookWithTokenJSONBody } from 'discord-api-types/v10';
import ActionRow from './components/ActionRow';
import Container from './components/Container';
import MediaGallery from './components/MediaGallery';
import Section from './components/Section';
import File, { FileOptions } from './components/File';
import Separator, { SeparatorOptions } from './components/Separator';
import TextDisplay from './components/TextDisplay';

/**
 * Class that allows you to build Components V2 messages
 *
 * @export
 * @class NewComponentBuilder
 */
export default class NewComponentBuilder {
  private MAX_COMPONENTS = 40;
  private _components: Array<APIMessageTopLevelComponent> = [];
  private readonly _prefix: string | null;
  private componentCount: number = 0;

  /**
   * Creates an instance of NewComponentBuilder.
   * @param {(string | null)} [prefix=null]
   * @memberof NewComponentBuilder
   */
  constructor(prefix: string | null = null) {
    this._prefix = prefix;
  }

  /**
   * Adds an ActionRow component
   *
   * @param {(builder: ActionRow) => void} [callback]
   * @return {*}
   * @memberof NewComponentBuilder
   */
  addActionRow(callback?: (builder: ActionRow) => void) {
    if (this.componentCount + this._components.length >= this.MAX_COMPONENTS) throw new TypeError(`Messages can't have more than ${this.MAX_COMPONENTS} components`);

    const builder = new ActionRow(this._prefix);
    callback?.(builder);
    const built = builder.build();
    this.componentCount += built.size;
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * Adds a Container component
   *
   * @param {(builder: Container) => void} [callback]
   * @return {*}
   * @memberof NewComponentBuilder
   */
  addContainer(callback?: (builder: Container) => void) {
    if (this.componentCount + this._components.length >= this.MAX_COMPONENTS) throw new TypeError(`Messages can't have more than ${this.MAX_COMPONENTS} components`);
    const builder = new Container(this._prefix);
    callback?.(builder);
    const built = builder.build();
    this.componentCount += built.size;
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * Adds a TextDisplay component
   *
   * @param {string} content
   * @param {number} [id]
   * @return {*}
   * @memberof NewComponentBuilder
   */
  addTextDisplay(content: string, id?: number) {
    if (this.componentCount + this._components.length >= this.MAX_COMPONENTS) throw new TypeError(`Messages can't have more than ${this.MAX_COMPONENTS} components`);
    const builder = new TextDisplay(content, id);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * Adds a Separator component
   *
   * @param {SeparatorOptions} [options={}]
   * @return {*}
   * @memberof NewComponentBuilder
   */
  addSeparator(options: SeparatorOptions = {}) {
    if (this.componentCount + this._components.length >= this.MAX_COMPONENTS) throw new TypeError(`Messages can't have more than ${this.MAX_COMPONENTS} components`);
    const builder = new Separator(options);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * Adds a File component
   *
   * @param {APIUnfurledMediaItem} file
   * @param {FileOptions} [options={}]
   * @return {*}
   * @memberof NewComponentBuilder
   */
  addFile(file: APIUnfurledMediaItem, options: FileOptions = {}) {
    if (this.componentCount + this._components.length >= this.MAX_COMPONENTS) throw new TypeError(`Messages can't have more than ${this.MAX_COMPONENTS} components`);
    const builder = new File(file, options);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * Adds a Section component
   *
   * @param {(builder: Section) => void} [callback]
   * @return {*}
   * @memberof NewComponentBuilder
   */
  addSection(callback?: (builder: Section) => void) {
    if (this.componentCount + this._components.length >= this.MAX_COMPONENTS) throw new TypeError(`Messages can't have more than ${this.MAX_COMPONENTS} components`);
    const builder = new Section(undefined, this._prefix);
    callback?.(builder);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    this.componentCount += built.size;
    return this;
  }

  /**
   * Adds a MediaGallery component
   *
   * @param {(builder: MediaGallery) => void} [callback]
   * @return {*}
   * @memberof NewComponentBuilder
   */
  addMediaGallery(callback?: (builder: MediaGallery) => void) {
    if (this.componentCount + this._components.length >= this.MAX_COMPONENTS) throw new TypeError(`Messages can't have more than ${this.MAX_COMPONENTS} components`);
    const builder = new MediaGallery();
    callback?.(builder);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * Converts the NewComponentBuilder to api friendly plain object. This creates a message object meant to be sent through
   * createMessage or any other message sending method, this is to limit restricted fields that should not be sent in Components V2
   * based messages.
   *
   * @return {*}  {(RESTPostAPIChannelMessageJSONBody | APIInteractionResponseCallbackData | RESTPostAPIWebhookWithTokenJSONBody)}
   * @memberof NewComponentBuilder
   */
  toMessageData(): Omit<RESTPostAPIChannelMessageJSONBody | APIInteractionResponseCallbackData | RESTPostAPIWebhookWithTokenJSONBody, 'content' | 'embeds' | 'sticker_ids' | 'poll'> {
    if (this.componentCount + this._components.length > this.MAX_COMPONENTS) throw new TypeError(`Messages can't have more than ${this.MAX_COMPONENTS} components`);
    return {
      flags: MessageFlags.IsComponentsV2,
      components: this._components
    };
  }
}
