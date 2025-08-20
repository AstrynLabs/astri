'use strict';

import type Client from '../Client';
import type { APIGuildVoiceChannel, RESTGetAPIChannelMessageReactionUsersQuery, RESTGetAPIChannelMessagesQuery, RESTPatchAPIChannelMessageJSONBody, RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';
import Collection from '../util/Collection';
import Message from './Message';
import GuildVoiceChannel from './GuildVoiceChannel';
import type { FileType } from '../rest/RequestHandler';

export default class VoiceTextChannel extends GuildVoiceChannel {
  messages: Collection<Message>;
  lastMessageID: string | null;
  rateLimitPerUser: number | null;
  lastPinTimestamp: number | null = null;
  constructor(data: APIGuildVoiceChannel, client: Client, messageLimit: number | null = null) {
    super(data, client);
    this.messages = new Collection(Message, messageLimit ?? client.options.messageLimit);
    this.lastMessageID = data.last_message_id ?? null;
    this.rateLimitPerUser = data.rate_limit_per_user ?? null;
  }

  update(data: APIGuildVoiceChannel) {
    super.update(data);
    // "not yet, possibly TBD"
    if (data.rate_limit_per_user !== undefined) {
      this.rateLimitPerUser = data.rate_limit_per_user;
    }
  }

  addMessageReaction(messageID: string, reaction: string) {
    return this.client.addMessageReaction(this.id, messageID, reaction);
  }

  createMessage(content: RESTPostAPIChannelMessageJSONBody, file?: FileType) {
    return this.client.createMessage(this.id, content, file);
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

  getMessage(messageID: string) {
    return this.client.getMessage(this.id, messageID);
  }

  getMessageReaction(messageID: string, reaction: string, options: RESTGetAPIChannelMessageReactionUsersQuery) {
    return this.client.getMessageReaction(this.id, messageID, reaction, options);
  }

  getMessages(options: RESTGetAPIChannelMessagesQuery) {
    return this.client.getMessages(this.id, options);
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
  toJSON(props: string[] = []) {
    return super.toJSON(['lastMessageID', 'messages', 'rateLimitPerUser', ...props]);
  }
}
