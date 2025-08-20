'use strict';

import Collection from '../util/Collection';
import GuildChannel from './GuildChannel';

/**
 * Represents a guild category channel. See GuildChannel for more properties and methods.
 * @extends GuildChannel
 * @prop {Collection<GuildChannel>} channels A collection of guild channels that are part of this category
 */
export default class CategoryChannel extends GuildChannel {
  get channels() {
    const channels = new Collection(GuildChannel);
    if (this.guild.channels) {
      for (const channel of this.guild.channels.values()) {
        if (channel.parentID === this.id) {
          channels.add(channel);
        }
      }
    }
    return channels;
  }
}
