'use strict';

import type { RESTPatchAPIStageInstanceJSONBody, RESTPostAPIStageInstanceJSONBody } from 'discord-api-types/v10';
import GuildVoiceChannel from './GuildVoiceChannel';

/**
 * Represents a guild stage channel. See VoiceChannel for more properties and methods.
 * @extends VoiceChannel
 * @prop {String?} topic The topic of the channel
 */
export default class StageChannel extends GuildVoiceChannel {
  /**
   * Create a stage instance
   * @arg {Object} options The stage instance options
   * @arg {Number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
   * @arg {String} options.topic The stage instance topic
   * @returns {Promise<StageInstance>}
   */
  createInstance(options: Omit<RESTPostAPIStageInstanceJSONBody, 'channel_id'>) {
    return this.client.createStageInstance(this.id, options);
  }

  /**
   * Delete the stage instance for this channel
   * @returns {Promise}
   */
  deleteInstance() {
    return this.client.deleteStageInstance(this.id);
  }

  /**
   * Update the stage instance for this channel
   * @arg {Object} options The properties to edit
   * @arg {Number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
   * @arg {String} [options.topic] The stage instance topic
   * @returns {Promise<StageInstance>}
   */
  editInstance(options: RESTPatchAPIStageInstanceJSONBody) {
    return this.client.editStageInstance(this.id, options);
  }

  /**
   * Get the stage instance for this channel
   * @returns {Promise<StageInstance>}
   */
  getInstance() {
    return this.client.getStageInstance(this.id);
  }
}
