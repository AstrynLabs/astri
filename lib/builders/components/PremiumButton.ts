import { APIButtonComponent, APIMessageComponentEmoji, ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { Buildable, ComponentBuilderBuildable } from '../../interfaces/Buildable';

export type PremiumButtonOptions = {
  id?: number;
  sku_id: string;
  disabled?: boolean;
};

/**
 * A component builder for a premium button component.
 *
 * @export
 * @class PremiumButton
 * @implements {Buildable<ComponentBuilderBuildable<APIButtonComponent>>}
 */
export default class PremiumButton implements Buildable<ComponentBuilderBuildable<APIButtonComponent>> {
  private id?: number;
  private sku_id: string;
  private disabled?: boolean;

  /**
   * Creates an instance of PremiumButton.
   * @param {PremiumButtonOptions} { id, sku_id, disabled }
   * @memberof PremiumButton
   */
  constructor({ id, sku_id, disabled }: PremiumButtonOptions) {
    this.id = id;
    this.sku_id = sku_id;
    this.disabled = disabled;
  }

  /**
   * INTERNAL CLASS USE - builds the container and sub components
   *
   * @return {*}  {ComponentBuilderBuildable<APIButtonComponent>}
   * @memberof PremiumButton
   */
  build(): ComponentBuilderBuildable<APIButtonComponent> {
    return {
      size: 1,
      built: {
        type: ComponentType.Button,
        id: this.id,
        style: ButtonStyle.Premium,
        sku_id: this.sku_id,
        disabled: this.disabled
      }
    };
  }
}
