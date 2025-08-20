import { APIFileComponent, APIUnfurledMediaItem, ComponentType } from 'discord-api-types/v10';
import { Buildable, ComponentBuilderBuildable } from '../../interfaces/Buildable';

export type FileOptions = {
  id?: number;
  spoiler?: boolean;
};

/**
 * A component builder for a file component.
 *
 * @export
 * @class File
 * @implements {Buildable<ComponentBuilderBuildable<APIFileComponent>>}
 */
export default class File implements Buildable<ComponentBuilderBuildable<APIFileComponent>> {
  private file: APIUnfurledMediaItem;
  private options: FileOptions;

  /**
   * Creates an instance of File.
   * @param {APIUnfurledMediaItem} file
   * @param {FileOptions} [options={}]
   * @memberof File
   */
  constructor(file: APIUnfurledMediaItem, options: FileOptions = {}) {
    this.options = options;
    this.file = file;
  }

  /**
   * INTERNAL CLASS USE - builds the container and sub components
   *
   * @return {*}  {ComponentBuilderBuildable<APIFileComponent>}
   * @memberof File
   */
  build(): ComponentBuilderBuildable<APIFileComponent> {
    return {
      size: 1,
      built: {
        type: ComponentType.File,
        file: this.file,
        ...this.options
      }
    };
  }
}
