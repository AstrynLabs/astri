import type { APIGuildForumChannel, APIGuildForumDefaultReactionEmoji, APIGuildForumTag, ForumLayoutType, RESTPostAPIGuildForumThreadsJSONBody, SortOrderType } from 'discord-api-types/v10';
import GuildChannel from './GuildChannel';
import type Client from '../Client';

export default class ForumChannel extends GuildChannel {
  defaultAutoArchiveDuration?: number;
  defaultReactionEmoji: APIGuildForumDefaultReactionEmoji | null;
  tags: APIGuildForumTag[];
  defaultSortOrder: SortOrderType | null;
  defaultForumLayout: ForumLayoutType | null;
  defaultRateLimitPerUser?: number;

  constructor(data: APIGuildForumChannel, client: Client) {
    super(data, client);

    this.update(data);
  }

  update(data: APIGuildForumChannel) {
    this.tags = data.available_tags;
    this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    this.defaultReactionEmoji = data.default_reaction_emoji;
    this.defaultSortOrder = data.default_sort_order;
    this.defaultForumLayout = data.default_forum_layout;
    this.defaultRateLimitPerUser = data.default_thread_rate_limit_per_user;
  }

  get threads() {
    return this.guild.threads.filter((thread) => thread.parentID === this.id);
  }

  createThread(options: RESTPostAPIGuildForumThreadsJSONBody) {
    return this.client.createThreadInThreadOnlyChannel(this.id, options);
  }
}
