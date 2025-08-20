'use strict';

import type { APIExtendedInvite, APIInvite, GatewayInviteCreateDispatchData, GatewayInviteDeleteDispatchData, InviteTargetType } from 'discord-api-types/v10';
import Base from './Base';
import Guild from './Guild';
import type Client from '../Client';
import BaseChannel from './BaseChannel';
import type User from './User';

/**
 * Represents an invite. Some properties are only available when fetching invites from channels, which requires the Manage Channel permission.
 * @prop {TextChannel | NewsChannel | TextVoiceChannel | GroupChannel | StageChannel | Object} channel Info on the invite channel
 * @prop {String} channel.id The ID of the invite's channel
 * @prop {String?} channel.name The name of the invite's channel
 * @prop {Number} channel.type The type of the invite's channel
 * @prop {String?} channel.icon The icon of a channel (group dm)
 * @prop {String} code The invite code
 * @prop {Number?} createdAt Timestamp of invite creation
 * @prop {Guild?} guild Info on the invite guild
 * @prop {User?} inviter The invite creator
 * @prop {Number?} maxAge How long the invite lasts in seconds
 * @prop {Number?} maxUses The max number of invite uses
 * @prop {Number?} memberCount The **approximate** member count for the guild
 * @prop {Number?} presenceCount The **approximate** presence count for the guild
 * @prop {Object?} stageInstance The active public stage instance data for the stage channel this invite is for
 * @prop {String?} targetApplicationID The target application id
 * @prop {Number?} targetType The type of the target application
 * @prop {User?} targetUser The user whose stream is displayed for the invite (voice channel only)
 * @prop {Boolean?} temporary Whether the invite grants temporary membership or not
 * @prop {Number?} uses The number of invite uses
 */
export default class Invite extends Base {
  _client: Client;
  code: string;
  channel: BaseChannel | null = null;
  guild: Guild | null = null;
  inviter: User | null = null;
  uses: number | null = null;
  maxUses: number | null = null;
  maxAge: number | null = null;
  temporary: boolean | null = null;
  _createdAt: string | number | null = null;
  presenceCount: number | null = null;
  memberCount: number | null = null;
  targetApplicationID: string | null = null;
  targetType: InviteTargetType | null;
  targetUser: User | null;
  constructor(data: APIInvite | APIExtendedInvite | GatewayInviteCreateDispatchData | GatewayInviteDeleteDispatchData, client: Client) {
    super(data.code);
    this._client = client;
    this.code = data.code;
    if ('channel' in data && data.channel) {
      if (data.guild && client.guilds.has(data.guild.id)) {
        this.channel = client.guilds.get(data.guild.id)!.channels.update(data.channel, client);
      } else {
        this.channel = new BaseChannel(data.channel, client);
      }
    }
    if ('guild' in data && data.guild) {
      if (client.guilds.has(data.guild.id)) {
        this.guild = client.guilds.update(data.guild, client);
      } else {
        // @ts-expect-error -- It's ok
        this.guild = new Guild(data.guild, client);
      }
    }
    if ('inviter' in data && data.inviter) {
      this.inviter = client.users.add(data.inviter, client);
    }

    if ('uses' in data) {
      this.uses = data.uses;
    }
    if ('max_uses' in data) {
      this.maxUses = data.max_uses;
    }
    if ('max_age' in data) {
      this.maxAge = data.max_age;
    }
    if ('temporary' in data) {
      this.temporary = data.temporary;
    }
    if ('created_at' in data) {
      this._createdAt = data.created_at;
    }
    if ('approximate_presence_count' in data && data.approximate_presence_count) {
      this.presenceCount = data.approximate_presence_count;
    }
    if ('approximate_member_count' in data && data.approximate_member_count) {
      this.memberCount = data.approximate_member_count;
    }
    this.targetApplicationID = 'target_application' in data && data.target_application !== undefined ? data.target_application.id! : null;
    this.targetType = 'target_type' in data ? data.target_type ?? null : null;
    this.targetUser = 'target_user' in data && data.target_user !== undefined ? this._client.users.update(data.target_user, this._client) : null;
  }

  get createdAt() {
    return typeof this._createdAt === 'number' ? this._createdAt : Date.parse(this._createdAt!);
  }

  /**
   * Delete the invite
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  delete(reason?: string) {
    return this._client.deleteInvite(this.code, reason);
  }

  toString() {
    return `[Invite ${this.code}]`;
  }

  toJSON(props = []) {
    return super.toJSON(['channel', 'code', 'createdAt', 'guild', 'maxAge', 'maxUses', 'memberCount', 'presenceCount', 'revoked', 'temporary', 'uses', ...props]);
  }
}
