import GuildChannel from './GuildChannel';
import type Client from '../Client';
import Collection from '../util/Collection';
import Message from './Message';
import type { GuildTextChannelData } from '../interfaces/Types';
import type { APIChannel, RESTGetAPIChannelMessageReactionUsersQuery, RESTGetAPIChannelMessagesQuery, RESTGetAPIChannelThreadsArchivedQuery, RESTPatchAPIChannelMessageJSONBody, RESTPostAPIChannelMessageJSONBody, RESTPostAPIChannelMessagesThreadsJSONBody, RESTPostAPIChannelThreadsJSONBody, RESTPostAPIChannelWebhookJSONBody } from 'discord-api-types/v10';
import type { FileType } from '../rest/RequestHandler';

export default class GuildTextChannel extends GuildChannel {
  messages: Collection<Message>;
  lastMessageID: string | null;
  rateLimitPerUser: number | null;
  lastPinTimestamp: number | null;
  defaultAutoArchiveDuration?: number;
  constructor(data: GuildTextChannelData, client: Client) {
    super(data, client);

    this.messages = new Collection(Message, client.options.messageLimit);
    this.lastMessageID = data.last_message_id ?? null;
    this.rateLimitPerUser = data.rate_limit_per_user ?? null;
    this.lastPinTimestamp = data.last_pin_timestamp ? Date.parse(data.last_pin_timestamp) : null;
    this.update(data);
  }

  update(data: GuildTextChannelData | APIChannel): void {
    // @ts-expect-error -- It's correct type
    super.update(data);
    if ('rate_limit_per_user' in data && data.rate_limit_per_user !== undefined) {
      this.rateLimitPerUser = data.rate_limit_per_user;
    }
    if ('default_auto_archive_duration' in data && data.default_auto_archive_duration !== undefined) {
      this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    }
  }

  addMessageReaction(messageID: string, reaction: string) {
    return this.client.addMessageReaction(this.id, messageID, reaction);
  }

  createMessage(content: RESTPostAPIChannelMessageJSONBody, file?: FileType) {
    return this.client.createMessage(this.id, content, file);
  }

  createThreadWithMessage(messageID: string, options: RESTPostAPIChannelMessagesThreadsJSONBody) {
    return this.client.createThreadWithMessage(this.id, messageID, options);
  }

  createThreadWithoutMessage(options: RESTPostAPIChannelThreadsJSONBody) {
    return this.client.createThreadWithoutMessage(this.id, options);
  }

  createWebhook(options: RESTPostAPIChannelWebhookJSONBody) {
    return this.client.createChannelWebhook(this.id, options);
  }

  deleteMessage(messageID: string, reason?: string) {
    return this.client.deleteMessage(this.id, messageID, reason);
  }

  deleteMessages(messageIDs: string[], reason?: string) {
    return this.client.deleteMessages(this.id, messageIDs, reason);
  }

  editMessage(messageID: string, content: RESTPatchAPIChannelMessageJSONBody) {
    return this.client.editMessage(this.id, messageID, content);
  }

  getArchivedThreads(type: 'public' | 'private', options?: RESTGetAPIChannelThreadsArchivedQuery) {
    return this.client.getArchivedThreads(this.id, type, options);
  }

  getJoinedPrivateArchivedThreads(options?: RESTGetAPIChannelMessageReactionUsersQuery) {
    return this.client.getJoinedPrivateArchivedThreads(this.id, options);
  }

  getMessage(messageID: string) {
    return this.client.getMessage(this.id, messageID);
  }

  getMessageReaction(messageID: string, reaction: string, options: RESTGetAPIChannelMessageReactionUsersQuery) {
    return this.client.getMessageReaction(this.id, messageID, reaction, options);
  }

  getMessages(options: RESTGetAPIChannelMessagesQuery) {
    return this.client.getMessages(this.id, options);
  }

  getPins() {
    return this.client.getPins(this.id);
  }

  getWebhooks() {
    return this.client.getChannelWebhooks(this.id);
  }

  pinMessage(messageID: string) {
    return this.client.pinMessage(this.id, messageID);
  }

  removeMessageReaction(messageID: string, reaction: string, userID?: string) {
    return this.client.removeMessageReaction(this.id, messageID, reaction, userID);
  }

  removeMessageReactionEmoji(messageID: string, reaction: string) {
    return this.client.removeMessageReactionEmoji(this.id, messageID, reaction);
  }

  removeMessageReactions(messageID: string) {
    return this.client.removeMessageReactions(this.id, messageID);
  }

  sendTyping() {
    return this.client.sendChannelTyping(this.id);
  }

  unpinMessage(messageID: string) {
    return this.client.unpinMessage(this.id, messageID);
  }

  toJSON(props: string[] = []) {
    return super.toJSON(['lastMessageID', 'lastPinTimestamp', 'messages', 'rateLimitPerUser', 'topic', ...props]);
  }
}
