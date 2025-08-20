'use strict';

import type { RESTPostAPIGuildForumThreadsJSONBody, APIGuildForumDefaultReactionEmoji, APIGuildForumTag, APIGuildMediaChannel, SortOrderType } from 'discord-api-types/v10';
import type Client from '../Client';
import GuildChannel from './GuildChannel';

/**
 * Represents a media channel. See ForumChannel for more properties and methods.
 *
 * @export
 * @class MediaChannel
 * @extends {ForumChannel}
 */
export default class MediaChannel extends GuildChannel {
  defaultAutoArchiveDuration?: number;
  defaultReactionEmoji: APIGuildForumDefaultReactionEmoji | null;
  tags: APIGuildForumTag[];
  defaultSortOrder: SortOrderType | null;
  defaultRateLimitPerUser?: number;

  constructor(data: APIGuildMediaChannel, client: Client) {
    super(data, client);

    this.update(data);
  }

  update(data: APIGuildMediaChannel) {
    this.tags = data.available_tags;
    this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    this.defaultReactionEmoji = data.default_reaction_emoji;
    this.defaultSortOrder = data.default_sort_order;
    this.defaultRateLimitPerUser = data.default_thread_rate_limit_per_user;
  }

  get threads() {
    return this.guild.threads.filter((thread) => thread.parentID === this.id);
  }

  createThread(options: RESTPostAPIGuildForumThreadsJSONBody) {
    return this.client.createThreadInThreadOnlyChannel(this.id, options);
  }
}
