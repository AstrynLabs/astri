import { APIMediaGalleryComponent, APIMediaGalleryItem, ComponentType } from 'discord-api-types/v10';
import { Buildable, ComponentBuilderBuildable } from '../../interfaces/Buildable';

/**
 * A component builder for a media gallery component.
 *
 * @export
 * @class MediaGallery
 * @implements {Buildable<ComponentBuilderBuildable<APIMediaGalleryComponent>>}
 */
export default class MediaGallery implements Buildable<ComponentBuilderBuildable<APIMediaGalleryComponent>> {
  private items: Array<APIMediaGalleryItem> = [];
  private id: number | undefined;

  /**
   * Creates an instance of MediaGallery.
   * @param {number} [id]
   * @memberof MediaGallery
   */
  constructor(id?: number) {
    this.id = id;
  }

  /**
   * Adds a media item to the media gallery
   *
   * @param {APIMediaGalleryItem} item
   * @return {*}
   * @memberof MediaGallery
   */
  addMediaItem(item: APIMediaGalleryItem) {
    if (this.items.length >= 10) throw new TypeError('Media gallery can only have 10 items');
    this.items.push(item);
    return this;
  }

  /**
   * INTERNAL CLASS USE - builds the container and sub components
   *
   * @return {*}  {ComponentBuilderBuildable<APIMediaGalleryComponent>}
   * @memberof MediaGallery
   */
  build(): ComponentBuilderBuildable<APIMediaGalleryComponent> {
    return {
      size: 1,
      built: {
        type: ComponentType.MediaGallery,
        items: this.items,
        id: this.id
      }
    };
  }
}
