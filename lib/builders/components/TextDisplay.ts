import { APITextDisplayComponent, ComponentType } from 'discord-api-types/v10';
import { Buildable, ComponentBuilderBuildable } from '../../interfaces/Buildable';

/**
 * A component builder for a text display component.
 *
 * @export
 * @class TextDisplay
 * @implements {Buildable<ComponentBuilderBuildable<APITextDisplayComponent>>}
 */
export default class TextDisplay implements Buildable<ComponentBuilderBuildable<APITextDisplayComponent>> {
  private content: string;
  private id: number | undefined;

  constructor(content: string, id?: number) {
    this.content = content;
    this.id = id;
  }

  /**
   * INTERNAL CLASS USE - builds the container and sub components
   *
   * @return {*}  {ComponentBuilderBuildable<APITextDisplayComponent>}
   * @memberof TextDisplay
   */
  build(): ComponentBuilderBuildable<APITextDisplayComponent> {
    return {
      size: 1,
      built: {
        type: ComponentType.TextDisplay,
        content: this.content,
        id: this.id
      }
    };
  }
}
