'use strict';

import type Client from '../Client';
import { ChannelType, type APIChannel, type APIThreadChannel, type GatewayThreadMembersUpdate } from 'discord-api-types/v10';

import Collection from '../util/Collection';
import Message from './Message';
import ThreadMember from './ThreadMember';
import GuildTextChannel from './GuildTextChannel';

/**
 * Represents a thread channel. You also probably want to look at NewsThreadChannel, PublicThreadChannel, and PrivateThreadChannel. See GuildChannel for extra properties.
 * @extends GuildChannel
 * @prop {String} lastMessageID The ID of the last message in this channel
 * @prop {Object?} member Thread member for the current user, if they have joined the thread
 * @prop {Number} member.flags The user's thread settings
 * @prop {String} member.id The ID of the thread
 * @prop {Number} member.joinTimestamp The time the user last joined the thread
 * @prop {String} member.userID The ID of the user
 * @prop {Number} memberCount An approximate number of users in the thread (stops at 50)
 * @prop {Collection<ThreadMember>} members Collection of members in this channel
 * @prop {Number} messageCount An approximate number of messages in the thread (stops at 50)
 * @prop {Collection<Message>} messages Collection of Messages in this channel
 * @prop {String} ownerID The ID of the user that created the thread
 * @prop {Number} rateLimitPerUser The ratelimit of the channel, in seconds. 0 means no ratelimit is enabled
 * @prop {Object} threadMetadata Metadata for the thread
 * @prop {Number} threadMetadata.archiveTimestamp Timestamp when the thread's archive status was last changed, used for calculating recent activity
 * @prop {Boolean} threadMetadata.archived Whether the thread is archived
 * @prop {Number} threadMetadata.autoArchiveDuration Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
 * @prop {Boolean} threadMetadata.locked Whether the thread is locked
 */
export default class ThreadChannel extends GuildTextChannel {
  messages: Collection<Message>;
  members: Collection<ThreadMember>;
  lastMessageID: string | null;
  ownerID?: string;
  memberCount: number;
  messageCount: number;
  threadMetadata?: { archiveTimestamp: number; archived: boolean; autoArchiveDuration: number; locked?: boolean; invitable?: boolean };
  constructor(data: APIThreadChannel, client: Client) {
    super(data, client);
    this.messages = new Collection(Message, client.options.messageLimit);
    this.members = new Collection(ThreadMember);
    this.lastMessageID = data.last_message_id ?? null;
    this.ownerID = data.owner_id;
    this.update(data);
  }

  update(data: APIThreadChannel | APIChannel | GatewayThreadMembersUpdate) {
    // @ts-expect-error -- GuildTextChannel doesn't need GatewayThreadMembersUpdate
    super.update(data);
    if ('member_count' in data && data.member_count !== undefined) {
      this.memberCount = data.member_count;
    }
    if ('message_count' in data && data.message_count !== undefined) {
      this.messageCount = data.message_count;
    }
    if ('thread_metadata' in data && data.thread_metadata !== undefined) {
      this.threadMetadata = {
        archiveTimestamp: Date.parse(data.thread_metadata.archive_timestamp),
        archived: data.thread_metadata.archived,
        autoArchiveDuration: data.thread_metadata.auto_archive_duration,
        locked: data.thread_metadata.locked,
        invitable: data.thread_metadata.invitable
      };
    }
    if ('member' in data && data.member?.id !== undefined) {
      if (!this.members) this.members = new Collection(ThreadMember);
      this.members.add(new ThreadMember(data.member, this.client));
    }
  }

  isPrivate() {
    return this.type === ChannelType.PrivateThread;
  }

  /**
   * Get a list of members that are part of this thread channel
   * @returns {Promise<Array<ThreadMember>>}
   */
  async getMembers() {
    const members = await this.client.getThreadMembers(this.id);
    members.forEach((member) => this.members.update(member));

    return this.members;
  }

  /**
   * Join a thread
   * @arg {String} [userID="@me"] The user ID of the user joining
   * @returns {Promise}
   */
  join(userID?: string) {
    return this.client.joinThread(this.id, userID);
  }

  /**
   * Leave a thread
   * @arg {String} [userID="@me"] The user ID of the user leaving
   * @returns {Promise}
   */
  leave(userID?: string) {
    return this.client.leaveThread(this.id, userID);
  }

  toJSON(props = []) {
    return super.toJSON(['lastMessageID', 'memberCount', 'messageCount', 'messages', 'ownerID', 'rateLimitPerUser', 'threadMetadata', 'member', ...props]);
  }
}
