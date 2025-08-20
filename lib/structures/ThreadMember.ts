'use strict';

import type { APIThreadMember, ThreadMemberFlags } from 'discord-api-types/v10';
import Base from './Base';
import type Client from '../Client';
import type Member from './Member';

/**
 * Represents a thread member
 * @prop {Number} flags The user-thread settings of this member
 * @prop {Member?} guildMember The guild member that this thread member belongs to. This will never be present when fetching over REST
 * @prop {String} id The ID of the thread member
 * @prop {Number} joinTimestamp Timestamp of when the member joined the thread
 * @prop {String} threadID The ID of the thread this member is a part of
 */
export default class ThreadMember extends Base {
  _client: Client;
  flags: ThreadMemberFlags;
  threadID?: string;
  joinTimestamp: number;
  guildMember: Member;
  constructor(data: APIThreadMember, client: Client) {
    super(data.user_id);
    this._client = client;
    this.flags = data.flags;
    this.threadID = data.id;
    this.joinTimestamp = Date.parse(data.join_timestamp);

    if (data.member !== undefined && this.threadID) {
      const guild = this._client.guilds.get(this._client.threadGuildMap[this.threadID]);
      if (guild) {
        // @ts-expect-error -- Correct type
        this.guildMember = guild.members.update(data.member, guild);
      }
    }

    this.update(data);
  }

  update(data: APIThreadMember) {
    if (data.flags !== undefined) {
      this.flags = data.flags;
    }
  }

  /**
   * Remove the member from the thread
   * @returns {Promise}
   */
  leave() {
    if (!this.threadID) throw new Error('Member was sent without thread ID');
    return this._client.leaveThread(this.threadID, this.id);
  }

  toJSON(props = []) {
    return super.toJSON(['threadID', 'joinTimestamp', ...props]);
  }
}
