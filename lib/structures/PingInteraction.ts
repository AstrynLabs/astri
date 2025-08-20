'use strict';

import Interaction from './Interaction';
import { InteractionResponseType } from 'discord-api-types/v10';

/**
 * Represents a ping interaction. See Interaction for more properties.
 * @extends Interaction
 */
export default class PingInteraction extends Interaction {
  /**
   * Acknowledges the ping interaction with a pong response.
   * Note: You can **not** use more than 1 initial interaction response per interaction.
   * @returns {Promise}
   */
  pong() {
    if (this.acknowledged) {
      throw new Error('You have already acknowledged this interaction.');
    }
    return this._client
      .createInteractionResponse(this.id, this.token, {
        type: InteractionResponseType.Pong
      })
      .then(() => this.update());
  }
}
