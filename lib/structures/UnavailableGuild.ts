'use strict';

import type { APIUnavailableGuild } from 'discord-api-types/v10';
import type Client from '../Client';
import type Shard from '../gateway/Shard';

import Base from './Base';

/**
 * Represents a guild
 * @prop {String} id The ID of the guild
 * @prop {Boolean} unavailable Whether the guild is unavailable or not
 * @prop {Shard} shard The Shard that owns the guild
 */
export default class UnavailableGuild extends Base {
  shard: Shard;
  unavailable: boolean;
  constructor(data: APIUnavailableGuild, client: Client) {
    super(data.id);
    this.shard = client.shards.get(client.guildShardMap[this.id])!;
    this.unavailable = !!data.unavailable;
  }

  toJSON(props = []) {
    return super.toJSON(['unavailable', ...props]);
  }
}
