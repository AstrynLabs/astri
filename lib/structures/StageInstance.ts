'use strict';

import type { APIStageInstance, RESTPatchAPIStageInstanceJSONBody, StageInstancePrivacyLevel } from 'discord-api-types/v10';
import Base from './Base';
import type Client from '../Client';
import type GuildChannel from './GuildChannel';
import type Guild from './Guild';

/**
 * Represents a stage instance
 * @prop {StageChannel} channel The associated stage channel
 * @prop {Boolean} discoverableDisabled Whether or not stage discovery is disabled
 * @prop {Guild} guild The guild of the associated stage channel
 * @prop {String} id The ID of the stage instance
 * @prop {Number} privacyLevel The privacy level of the stage instance. 1 is public, 2 is guild only
 * @prop {String} topic The stage instance topic
 */
export default class StageInstance extends Base {
  _client: Client;
  channel: GuildChannel;
  guild: Guild;
  privacyLevel?: StageInstancePrivacyLevel;
  topic?: string;
  constructor(data: APIStageInstance, client: Client) {
    super(data.id);
    this._client = client;
    this.channel = client.getChannel(data.channel_id) as GuildChannel;
    this.guild = client.guilds.get(data.guild_id)!;
    this.update(data);
  }

  update(data: APIStageInstance) {
    if (data.privacy_level !== undefined) {
      this.privacyLevel = data.privacy_level;
    }
    if (data.topic !== undefined) {
      this.topic = data.topic;
    }
  }

  /**
   * Delete this stage instance
   * @returns {Promise}
   */
  delete() {
    return this._client.deleteStageInstance(this.channel.id);
  }

  /**
   * Update this stage instance
   * @arg {Object} options The properties to edit
   * @arg {Number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
   * @arg {String} [options.topic] The stage instance topic
   * @returns {Promise<StageInstance>}
   */
  edit(options: RESTPatchAPIStageInstanceJSONBody) {
    return this._client.editStageInstance(this.channel.id, options);
  }
}
