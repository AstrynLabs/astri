import { APIButtonComponent, ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { Buildable, ComponentBuilderBuildable } from '../../interfaces/Buildable';

export type URLButtonOptions = {
  id?: number;
  label?: string;
  url: string;
  disabled?: boolean;
};

/**
 * A component builder for a URL button component.
 *
 * @export
 * @class URLButton
 * @implements {Buildable<ComponentBuilderBuildable<APIButtonComponent>>}
 */
export default class URLButton implements Buildable<ComponentBuilderBuildable<APIButtonComponent>> {
  private id?: number;
  private label?: string;
  private url: string;
  private disabled?: boolean;

  constructor({ id, label, url, disabled }: URLButtonOptions) {
    this.id = id;
    this.label = label;
    this.url = url;
    this.disabled = disabled;
  }

  /**
   * INTERNAL CLASS USE - builds the container and sub components
   *
   * @return {*}  {ComponentBuilderBuildable<APIButtonComponent>}
   * @memberof URLButton
   */
  build(): ComponentBuilderBuildable<APIButtonComponent> {
    return {
      size: 1,
      built: {
        type: ComponentType.Button,
        id: this.id,
        style: ButtonStyle.Link,
        label: this.label,
        url: this.url,
        disabled: this.disabled
      }
    };
  }
}
