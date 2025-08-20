'use strict';

import Collection from '../util/Collection';
import Message from './Message';
import User from './User';
import BaseChannel from './BaseChannel';
import type { APIDMChannel, RESTGetAPIChannelMessageReactionUsersQuery, RESTGetAPIChannelMessagesQuery, RESTPatchAPIChannelMessageJSONBody, RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';
import type Client from '../Client';

/**
 * Represents a private channel. See Channel for more properties and methods.
 * @extends Channel
 * @prop {String} lastMessageID The ID of the last message in this channel
 * @prop {Collection<Message>} messages Collection of Messages in this channel
 * @prop {User} recipient The recipient in this private channel (private channels only)
 */
export default class PrivateChannel extends BaseChannel {
  messages: Collection<Message>;
  lastMessageID: string | null;
  recipient?: User;
  lastPinTimestamp: number | null = null;
  constructor(data: APIDMChannel, client: Client) {
    super(data, client);
    this.lastMessageID = data.last_message_id ?? null;
    if ('recipients' in data && data.recipients) {
      this.recipient = new User(data.recipients[0], client);
    }
    this.messages = new Collection(Message, client.options.messageLimit);
  }

  /**
   * Add a reaction to a message
   * @arg {String} messageID The ID of the message
   * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @arg {String} [userID="@me"] The ID of the user to react as. Passing this parameter is deprecated and will not be supported in future versions.
   * @returns {Promise}
   */
  addMessageReaction(messageID: string, reaction: string) {
    return this.client.addMessageReaction(this.id, messageID, reaction);
  }

  /**
   * Create a message in a text channel
   * @arg {String | Object} content A string or object. If an object is passed:
   * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
   * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @arg {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
   * @arg {Array<Object>} [content.components] An array of components. See [the official Discord API documentation entry](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
   * @arg {String} [content.content] A content string
   * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Object} [content.messageReference] The message reference, used when replying to messages
   * @arg {String} [content.messageReference.channelID] The channel ID of the referenced message
   * @arg {Boolean} [content.messageReference.failIfNotExists=true] Whether to throw an error if the message reference doesn't exist. If false, and the referenced message doesn't exist, the message is created without a referenced message
   * @arg {String} [content.messageReference.guildID] The guild ID of the referenced message
   * @arg {String} content.messageReference.messageID The message ID of the referenced message. This cannot reference a system message
   * @arg {String} [content.messageReferenceID] [DEPRECATED] The ID of the message should be replied to. Use `messageReference` instead
   * @arg {Array<String>} [content.stickerIDs] An array of IDs corresponding to stickers to send
   * @arg {Boolean} [content.tts] Set the message TTS flag
   * @arg {Object | Array<Object>} [file] A file object (or an Array of them)
   * @arg {Buffer} file.file A buffer containing file data
   * @arg {String} file.name What to name the file
   * @returns {Promise<Message>}
   */
  createMessage(content: RESTPostAPIChannelMessageJSONBody, file?: { file: Buffer; name: string } | Array<{ file: Buffer; name: string }>) {
    return this.client.createMessage(this.id, content, file);
  }

  /**
   * Delete a message
   * @arg {String} messageID The ID of the message
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteMessage(messageID: string, reason?: string) {
    return this.client.deleteMessage(this.id, messageID, reason);
  }

  /**
   * Edit a message
   * @arg {String} messageID The ID of the message
   * @arg {String | Array | Object} content A string, array of strings, or object. If an object is passed:
   * @arg {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
   * @arg {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @arg {Boolean | Array<String>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @arg {Boolean | Array<String>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @arg {Array<Object>} [content.components] An array of components. See [the official Discord API documentation entry](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
   * @arg {String} [content.content] A content string
   * @arg {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @arg {Object | Array<Object>} [content.file] A file object (or an Array of them)
   * @arg {Buffer} content.file[].file A buffer containing file data
   * @arg {String} content.file[].name What to name the file
   * @arg {Number} [content.flags] A number representing the flags to apply to the message. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for flags reference
   * @returns {Promise<Message>}
   */
  editMessage(messageID: string, content: RESTPatchAPIChannelMessageJSONBody) {
    return this.client.editMessage(this.id, messageID, content);
  }

  /**
   * Get a previous message in a text channel
   * @arg {String} messageID The ID of the message
   * @returns {Promise<Message>}
   */
  getMessage(messageID: string) {
    return this.client.getMessage(this.id, messageID);
  }

  /**
   * Get a list of users who reacted with a specific reaction
   * @arg {String} messageID The ID of the message
   * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @arg {Object} [options] Options for the request. If this is a number, it is treated as `options.limit` ([DEPRECATED] behavior)
   * @arg {Number} [options.limit=100] The maximum number of users to get
   * @arg {String} [options.after] Get users after this user ID
   * @arg {String} [before] [DEPRECATED] Get users before this user ID. Discord no longer supports this parameter
   * @arg {String} [after] [DEPRECATED] Get users after this user ID
   * @returns {Promise<Array<User>>}
   */
  getMessageReaction(messageID: string, reaction: string, options: RESTGetAPIChannelMessageReactionUsersQuery) {
    return this.client.getMessageReaction(this.id, messageID, reaction, options);
  }

  /**
   * Get a previous message in a text channel
   * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @arg {String} [options.after] Get messages after this message ID
   * @arg {String} [options.around] Get messages around this message ID (does not work with limit > 100)
   * @arg {String} [options.before] Get messages before this message ID
   * @arg {Number} [options.limit=50] The max number of messages to get
   * @arg {String} [before] [DEPRECATED] Get messages before this message ID
   * @arg {String} [after] [DEPRECATED] Get messages after this message ID
   * @arg {String} [around] [DEPRECATED] Get messages around this message ID (does not work with limit > 100)
   * @returns {Promise<Array<Message>>}
   */
  getMessages(options: RESTGetAPIChannelMessagesQuery) {
    return this.client.getMessages(this.id, options);
  }

  /**
   * Get all the pins in a text channel
   * @returns {Promise<Array<Message>>}
   */
  getPins() {
    return this.client.getPins(this.id);
  }

  /**
   * Leave the channel
   * @returns {Promise}
   */
  leave() {
    return this.client.deleteChannel(this.id);
  }

  /**
   * Pin a message
   * @arg {String} messageID The ID of the message
   * @returns {Promise}
   */
  pinMessage(messageID: string) {
    return this.client.pinMessage(this.id, messageID);
  }

  /**
   * Remove a reaction from a message
   * @arg {String} messageID The ID of the message
   * @arg {String} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @arg {String} [userID="@me"] The ID of the user to remove the reaction for. Passing this parameter is deprecated and will not be supported in future versions.
   * @returns {Promise}
   */
  removeMessageReaction(messageID: string, reaction: string) {
    return this.client.removeMessageReaction(this.id, messageID, reaction);
  }

  /**
   * Send typing status in a text channel
   * @returns {Promise}
   */
  sendTyping() {
    return this.client.sendChannelTyping(this.id);
  }

  /**
   * Unpin a message
   * @arg {String} messageID The ID of the message
   * @returns {Promise}
   */
  unpinMessage(messageID: string) {
    return this.client.unpinMessage(this.id, messageID);
  }

  toJSON(props = []) {
    return super.toJSON(['lastMessageID', 'messages', 'recipient', ...props]);
  }
}
