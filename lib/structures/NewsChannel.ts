'use strict';

import type { APIFollowedChannel, APINewsChannel } from 'discord-api-types/v10';
import type Client from '../Client';
import type Message from './Message';
import GuildTextChannel from './GuildTextChannel';

/**
 * Represents a guild news channel. See TextChannel for more properties and methods.
 * @extends TextChannel
 */
export default class NewsChannel extends GuildTextChannel {
  rateLimitPerUser = 0;
  constructor(data: APINewsChannel, client: Client) {
    super(data, client);
    this.update(data);
  }
  /**
   * Crosspost (publish) a message to subscribed channels
   * @arg {String} messageID The ID of the message
   * @returns {Promise<Message>}
   */
  crosspostMessage(messageID: string): Promise<Message> {
    return this.client.crosspostMessage(this.id, messageID);
  }

  /**
   * Follow this channel in another channel. This creates a webhook in the target channel
   * @arg {String} webhookChannelID The ID of the target channel
   * @returns {Promise<APIFollowedChannel>} An object containing this channel's ID and the new webhook's ID
   */
  follow(webhookChannelID: string): Promise<APIFollowedChannel> {
    return this.client.followChannel(this.id, webhookChannelID);
  }
}
