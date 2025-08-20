import { APIButtonComponent, APIMessageComponentEmoji, ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { Buildable, ComponentBuilderBuildable } from '../../interfaces/Buildable';

export type NormalButtonOptions = {
  id?: number;
  style: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
  label?: string;
  emoji?: string | APIMessageComponentEmoji;
  custom_id: string;
  disabled?: boolean;
};

/**
 * A component builder for a normal button component.
 *
 * @export
 * @class NormalButton
 * @implements {Buildable<ComponentBuilderBuildable<APIButtonComponent>>}
 */
export default class NormalButton implements Buildable<ComponentBuilderBuildable<APIButtonComponent>> {
  private id?: number;
  private style: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
  private label?: string;
  private emoji?: APIMessageComponentEmoji;
  private custom_id: string;
  private disabled?: boolean;

  /**
   * Creates an instance of NormalButton.
   * @param {NormalButtonOptions} { id, style, label, emoji, custom_id, disabled }
   * @memberof NormalButton
   */
  constructor({ id, style, label, emoji, custom_id, disabled }: NormalButtonOptions) {
    this.id = id;
    if (typeof emoji === 'string') emoji = this.formatEmoji(emoji);
    this.style = style;
    this.label = label;
    this.emoji = emoji;
    this.custom_id = custom_id;
    this.disabled = disabled;
  }

  /**
   * INTERNAL CLASS USE - builds the container and sub components
   *
   * @return {*}  {ComponentBuilderBuildable<APIButtonComponent>}
   * @memberof NormalButton
   */
  build(): ComponentBuilderBuildable<APIButtonComponent> {
    return {
      size: 1,
      built: {
        type: ComponentType.Button,
        id: this.id,
        style: this.style,
        label: this.label,
        emoji: this.emoji,
        custom_id: this.custom_id,
        disabled: this.disabled
      }
    };
  }

  private formatEmoji(emoji: string): APIMessageComponentEmoji {
    const cleaned = emoji.replace(/(<:)|(<)|(>)/g, '');
    const split = cleaned.split(':');

    let animated = false;
    if (split.length === 3) {
      animated = true;
      split.shift();
    }

    return {
      animated,
      name: split[0],
      id: split[1] ?? undefined
    };
  }
}
