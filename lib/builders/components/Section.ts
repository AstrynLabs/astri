import { APISectionAccessoryComponent, APISectionComponent, APITextDisplayComponent, APIUnfurledMediaItem, ComponentType } from 'discord-api-types/v10';
import { Buildable, ComponentBuilderBuildable } from '../../interfaces/Buildable';
import TextDisplay from './TextDisplay';
import NormalButton, { NormalButtonOptions } from './NormalButton';
import PremiumButton, { PremiumButtonOptions } from './PremiumButton';
import URLButton, { URLButtonOptions } from './URLButton';

export type ThumbnailOptions = {
  id?: number;
  description?: string;
  spoiler?: boolean;
};

/**
 * A component builder for a section component.
 *
 * @export
 * @class Section
 * @implements {Buildable<ComponentBuilderBuildable<APISectionComponent>>}
 */
export default class Section implements Buildable<ComponentBuilderBuildable<APISectionComponent>> {
  private readonly _components: Array<APITextDisplayComponent> = [];
  private accessory: APISectionAccessoryComponent;
  private readonly _prefix: string | null;
  private id: number | undefined;

  constructor(id?: number, prefix?: string | null) {
    this.id = id;
    this._prefix = prefix ?? null;
  }

  /**
   * Adds a text display component to the section.
   *
   * @param {string} content
   * @param {number} [id]
   * @return {*}
   * @memberof Section
   */
  addTextDisplay(content: string, id?: number) {
    if (this._components.length >= 3) throw new TypeError("Section can't have more than 3 TextDisplay components");
    const builder = new TextDisplay(content, id);
    const built = builder.build();
    if (built.size > 0) this._components.push(built.built);
    return this;
  }

  /**
   * Sets the accessory of the section to a normal button.
   *
   * @param {NormalButtonOptions} options
   * @return {*}
   * @memberof Section
   */
  setAccessoryAsNormalButton(options: NormalButtonOptions) {
    if (this._prefix) options.custom_id = `${this._prefix}:${options.custom_id}`;
    const builder = new NormalButton(options);
    const built = builder.build();
    this.accessory = built.built;
    return this;
  }

  /**
   * Sets the accessory of the section to a premium button.
   *
   * @param {PremiumButtonOptions} options
   * @return {*}
   * @memberof Section
   */
  setAccessoryAsPremiumButton(options: PremiumButtonOptions) {
    const builder = new PremiumButton(options);
    const built = builder.build();
    this.accessory = built.built;
    return this;
  }

  /**
   * Sets the accessory of the section to a URL button.
   *
   * @param {URLButtonOptions} options
   * @return {*}
   * @memberof Section
   */
  setAccessoryAsURLButton(options: URLButtonOptions) {
    const builder = new URLButton(options);
    const built = builder.build();
    this.accessory = built.built;
    return this;
  }

  /**
   * Sets the accessory of the section to a thumbnail.
   *
   * @param {APIUnfurledMediaItem} media
   * @param {ThumbnailOptions} [options={}]
   * @return {*}
   * @memberof Section
   */
  setAccessoryAsThumbnail(media: APIUnfurledMediaItem, options: ThumbnailOptions = {}) {
    this.accessory = {
      type: ComponentType.Thumbnail,
      media: media,
      ...options
    };
    return this;
  }

  /**
   * INTERNAL CLASS USE - builds the container and sub components
   *
   * @return {*}  {ComponentBuilderBuildable<APISectionComponent>}
   * @memberof Section
   */
  build(): ComponentBuilderBuildable<APISectionComponent> {
    if (!this.accessory) throw new TypeError('You must set an accessory before building the section');
    return {
      size: this._components.length,
      built: {
        type: ComponentType.Section,
        components: this._components,
        accessory: this.accessory,
        id: this.id
      }
    };
  }
}
