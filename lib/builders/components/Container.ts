import { APIComponentInContainer, APIContainerComponent, APIUnfurledMediaItem, ComponentType } from 'discord-api-types/v10';
import { Buildable, ComponentBuilderBuildable } from '../../interfaces/Buildable';
import ActionRow from './ActionRow';
import TextDisplay from './TextDisplay';
import Separator, { SeparatorOptions } from './Separator';
import File, { FileOptions } from './File';
import Section from './Section';
import MediaGallery from './MediaGallery';

/**
 * Class that allows you to build Container components
 *
 * @export
 * @class Container
 * @implements {Buildable<ComponentBuilderBuildable<APIContainerComponent>>}
 */
export default class Container implements Buildable<ComponentBuilderBuildable<APIContainerComponent>> {
  private readonly _components: Array<APIComponentInContainer> = [];
  private readonly _prefix: string | null;
  private componentCount: number = 0;
  private options: { id?: number; accent_color?: number; spoiler?: boolean } = {};

  /**
   * Creates an instance of Container.
   * @param {(string | null)} [prefix=null]
   * @memberof Container
   */
  constructor(prefix: string | null = null) {
    this._prefix = prefix;
  }

  /**
   * Sets the ID of the container, optional and discord will generate one if not provided
   *
   * @param {number} id
   * @return {*}
   * @memberof Container
   */
  setID(id: number) {
    this.options.id = id;
    return this;
  }

  /**
   * Sets the accent color of the container, optional and will have no accent if not provided
   *
   * @param {number} color
   * @return {*}
   * @memberof Container
   */
  setAccentColor(color: number) {
    this.options.accent_color = color;
    return this;
  }

  /**
   * Sets whether the container is a spoiler, optional and defaults to false
   *
   * @param {boolean} spoiler
   * @return {*}
   * @memberof Container
   */
  setSpoiler(spoiler: boolean) {
    this.options.spoiler = spoiler;
    return this;
  }

  /**
   * Adds an action row to the container
   *
   * @param {(builder: ActionRow) => void} [callback]
   * @return {*}
   * @memberof Container
   */
  addActionRow(callback?: (builder: ActionRow) => void) {
    const builder = new ActionRow(this._prefix);
    callback?.(builder);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    this.componentCount += built.size;
    return this;
  }

  /**
   * Adds a text display to the container
   *
   * @param {string} content
   * @param {number} [id]
   * @return {*}
   * @memberof Container
   */
  addTextDisplay(content: string, id?: number) {
    const builder = new TextDisplay(content, id);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * Adds a separator to the container
   *
   * @param {SeparatorOptions} [options={}]
   * @return {*}
   * @memberof Container
   */
  addSeparator(options: SeparatorOptions = {}) {
    const builder = new Separator(options);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * Adds a file to the container
   *
   * @param {APIUnfurledMediaItem} file
   * @param {FileOptions} [options={}]
   * @return {*}
   * @memberof Container
   */
  addFile(file: APIUnfurledMediaItem, options: FileOptions = {}) {
    const builder = new File(file, options);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * Adds a section to the container
   *
   * @param {(builder: Section) => void} [callback]
   * @return {*}
   * @memberof Container
   */
  addSection(callback?: (builder: Section) => void) {
    const builder = new Section(undefined, this._prefix);
    callback?.(builder);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    this.componentCount += built.size;
    return this;
  }

  /**
   * Adds a media gallery to the container
   *
   * @param {(builder: MediaGallery) => void} [callback]
   * @return {*}
   * @memberof Container
   */
  addMediaGallery(callback?: (builder: MediaGallery) => void) {
    const builder = new MediaGallery();
    callback?.(builder);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * INTERNAL CLASS USE - builds the container and sub components
   *
   * @return {*}  {ComponentBuilderBuildable<APIContainerComponent>}
   * @memberof Container
   */
  build(): ComponentBuilderBuildable<APIContainerComponent> {
    return {
      size: this._components.length + this.componentCount,
      built: {
        type: ComponentType.Container,
        components: this._components,
        ...this.options
      }
    };
  }
}
