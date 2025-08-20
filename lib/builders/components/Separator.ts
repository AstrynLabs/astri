import { APISeparatorComponent, ComponentType } from 'discord-api-types/v10';
import { Buildable, ComponentBuilderBuildable } from '../../interfaces/Buildable';

export type SeparatorOptions = {
  divider?: boolean;
  id?: number;
  spacing?: 1 | 2 | undefined;
};

/**
 * A component builder for a separator component.
 *
 * @export
 * @class Separator
 * @implements {Buildable<ComponentBuilderBuildable<APISeparatorComponent>>}
 */
export default class Separator implements Buildable<ComponentBuilderBuildable<APISeparatorComponent>> {
  private options: SeparatorOptions;

  constructor(options: SeparatorOptions = {}) {
    this.options = options;
  }

  /**
   * INTERNAL CLASS USE - builds the container and sub components
   *
   * @return {*}  {ComponentBuilderBuildable<APISeparatorComponent>}
   * @memberof Separator
   */
  build(): ComponentBuilderBuildable<APISeparatorComponent> {
    return {
      size: 1,
      built: {
        type: ComponentType.Separator,
        ...this.options
      }
    };
  }
}
