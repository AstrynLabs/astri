'use strict';

import Base from './Base';
import Endpoints from '../rest/Endpoints';
import type User from './User';
import VoiceState from './VoiceState';
import { PresenceUpdateStatus } from 'discord-api-types/v10';
import type { APIGuildMember, GatewayActivity, GatewayGuildMemberUpdateDispatchData, GatewayPresenceClientStatus, GatewayPresenceUpdateDispatchData, GatewayVoiceStateUpdateDispatchData, ImageFormat, PresenceUpdateReceiveStatus, RESTPatchAPIGuildMemberJSONBody } from 'discord-api-types/v10';
import type Guild from './Guild';
import type Role from './Role';

/**
 * Represents a server member
 * @prop {Number?} accentColor The user's banner color, or null if no banner color (REST only)
 * @prop {Array<Object>?} activities The member's current activities
 * @prop {String?} avatar The hash of the member's guild avatar, or null if no guild avatar
 * @prop {String} avatarURL The URL of the user's avatar which can be either a JPG or GIF
 * @prop {String?} banner The hash of the user's banner, or null if no banner (REST only)
 * @prop {String?} bannerURL The URL of the user's banner
 * @prop {Boolean} bot Whether the user is an OAuth bot or not
 * @prop {Object?} clientStatus The member's per-client status
 * @prop {String} clientStatus.web The member's status on web. Either "online", "idle", "dnd", or "offline". Will be "online" for bots
 * @prop {String} clientStatus.desktop The member's status on desktop. Either "online", "idle", "dnd", or "offline". Will be "offline" for bots
 * @prop {String} clientStatus.mobile The member's status on mobile. Either "online", "idle", "dnd", or "offline". Will be "offline" for bots
 * @prop {Number?} communicationDisabledUntil Timestamp of timeout expiry. If `null`, the member is not timed out
 * @prop {Number} createdAt Timestamp of user creation
 * @prop {String} defaultAvatar The hash for the default avatar of a user if there is no avatar set
 * @prop {String} defaultAvatarURL The URL of the user's default avatar
 * @prop {String} discriminator The discriminator of the user
 * @prop {Object?} game The active game the member is playing
 * @prop {String} game.name The name of the active game
 * @prop {Number} game.type The type of the active game (0 is default, 1 is Twitch, 2 is YouTube)
 * @prop {String?} game.url The url of the active game
 * @prop {Guild} guild The guild the member is in
 * @prop {String} id The ID of the member
 * @prop {Number?} joinedAt Timestamp of when the member joined the guild
 * @prop {String} mention A string that mentions the member
 * @prop {String?} nick The server nickname of the member
 * @prop {Boolean?} pending Whether the member has passed the guild's Membership Screening requirements
 * @prop {Permission} permission [DEPRECATED] The guild-wide permissions of the member. Use Member#permissions instead
 * @prop {Permission} permissions The guild-wide permissions of the member
 * @prop {Number?} premiumSince Timestamp of when the member boosted the guild
 * @prop {Array<String>} roles An array of role IDs this member is a part of
 * @prop {String} staticAvatarURL The URL of the user's avatar (always a JPG)
 * @prop {String} status The member's status. Either "online", "idle", "dnd", or "offline"
 * @prop {User} user The user object of the member
 * @prop {String} username The username of the user
 * @prop {VoiceState} voiceState The voice state of the member
 */
export default class Member extends Base {
  guild: Guild;
  user: User;
  nick: string | null;
  roles: string[] = [];
  joinedAt: number | null = null;
  premiumSince: number | null = null;
  pending?: boolean;
  avatar: string | null = null;
  communicationDisabledUntil: number | null = null;
  status: PresenceUpdateReceiveStatus | null = null;
  clientStatus: GatewayPresenceClientStatus = { web: PresenceUpdateStatus.Offline, desktop: PresenceUpdateStatus.Offline, mobile: PresenceUpdateStatus.Offline };
  activities: GatewayActivity[] = [];
  constructor(data: APIGuildMember, guild: Guild) {
    // @ts-expect-error -- ID will be somewhere
    super(data.id || data.user.id); // eslint-disable-line @typescript-eslint/no-unsafe-argument

    this.guild = guild;

    this.nick = null;
    this.update(data);
  }

  update(data: APIGuildMember | GatewayGuildMemberUpdateDispatchData | GatewayPresenceUpdateDispatchData | GatewayVoiceStateUpdateDispatchData) {
    if ('activities' in data) {
      if (data.status !== undefined) {
        this.status = data.status;
      }
      if (data.client_status !== undefined) {
        this.clientStatus = Object.assign({ web: 'offline', desktop: 'offline', mobile: 'offline' }, data.client_status);
      }
      if (data.activities !== undefined) {
        this.activities = data.activities;
      }
    } else {
      if ('joined_at' in data && data.joined_at) {
        this.joinedAt = Date.parse(data.joined_at);
      }

      if ('premium_since' in data && data.premium_since !== undefined) {
        this.premiumSince = data.premium_since === null ? null : Date.parse(data.premium_since);
      }
      if ('suppress' in data && this.guild) {
        const state = this.guild.voiceStates.get(this.id);
        if (data.channel_id === null && !data.mute && !data.deaf && !data.suppress) {
          this.guild.voiceStates.delete(this.id);
        } else if (state) {
          state.update(data);
        } else if (data.channel_id !== null || data.mute || data.deaf || data.suppress) {
          // @ts-expect-error -- We actually want to pass GatewayVoiceState to update VoiceState
          this.guild.voiceStates.update(data);
        }
      }
      if ('nick' in data && data.nick) {
        this.nick = data.nick;
      }
      if ('roles' in data) {
        this.roles = data.roles;
      }
      if ('pending' in data) {
        this.pending = data.pending;
      }
      if ('avatar' in data && data.avatar) {
        this.avatar = data.avatar;
      }
      if ('communication_disabled_until' in data && data.communication_disabled_until) {
        this.communicationDisabledUntil = Date.parse(data.communication_disabled_until);
      }
      if ('member' in data && data.member) {
        this.update(data.member);
      }
      if ('user' in data && data.user) {
        this.user = this.guild.shard.client.users.get(data.user?.id as unknown as string)!;
        if (!this.user && data.user) {
          this.user = this.guild.shard.client.users.add(data.user, this.guild.shard.client);
        }
        if (!this.user) {
          throw new Error('User associated with Member not found: ' + data.user?.id);
        }
      }
    }
  }

  get accentColor() {
    return this.user?.accentColor;
  }

  get avatarURL() {
    return this.avatar ? this.guild.shard.client._formatImage(Endpoints.GUILD_AVATAR(this.guild.id, this.id, this.avatar)) : this.user?.avatarURL;
  }

  get banner() {
    return this.user?.banner;
  }

  get bannerURL() {
    return this.user?.bannerURL;
  }

  get bot() {
    return this.user?.bot;
  }

  get defaultAvatar() {
    return this.user?.defaultAvatar;
  }

  get defaultAvatarURL() {
    return this.user?.defaultAvatarURL;
  }

  get discriminator() {
    return this.user?.discriminator;
  }

  get mention() {
    return `<@!${this.id}>`;
  }

  get permissions() {
    return this.guild.permissionsOf(this);
  }

  get staticAvatarURL() {
    return this.user?.staticAvatarURL;
  }

  get username() {
    return this.user?.username;
  }

  get voiceState() {
    if (this.guild?.voiceStates.has(this.id)) {
      return this.guild.voiceStates.get(this.id);
    } else {
      return new VoiceState({
        id: this.id
      });
    }
  }

  get game() {
    return this.activities && this.activities.length > 0 ? this.activities[0] : null;
  }

  get displayColor() {
    const roles = this.roles.map((role) => this.guild.roles.get(role)).filter((role) => role?.color) as Role[];
    if (!roles.length) return 0;
    return roles.reduce((previous, role) => (role.comparePosition(previous) > 0 ? role : previous)).color;
  }

  get highestRole() {
    const roles = this.roles.map((role) => this.guild.roles.get(role)) as Role[];
    if (!roles.length) return null;
    return roles.reduce((previous, role) => (role.comparePosition(previous) > 0 ? role : previous));
  }

  displayName(useNick = false, useGlobal = false) {
    const nick = useNick ? this.nick : null;
    if (nick) {
      return nick;
    }
    return this.discriminator === '0' ? (useGlobal && this.user?.global_name ? this.user.global_name : this.username) : `${this.username}#${this.discriminator}`;
  }

  /**
   * Add a role to the guild member
   * @arg {String} roleID The ID of the role
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  addRole(roleID: string, reason?: string) {
    return this.guild.shard.client.addGuildMemberRole(this.guild.id, this.id, roleID, reason);
  }

  /**
   * Ban the user from the guild
   * @arg {Number} [deleteMessageDays=0] Number of days to delete messages for, between 0-7 inclusive
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  ban(deleteMessageDays: number = 0, reason?: string) {
    return this.guild.shard.client.banGuildMember(this.guild.id, this.id, deleteMessageDays, reason);
  }

  /**
   * Get the member's avatar with the given format and size
   * @arg {String} [format] The filetype of the avatar ("jpg", "jpeg", "png", "gif", or "webp")
   * @arg {Number} [size] The size of the avatar (any power of two between 16 and 4096)
   * @returns {String}
   */
  dynamicAvatarURL(format?: ImageFormat, size?: number) {
    if (!this.avatar) {
      return this.user?.dynamicAvatarURL(format, size);
    }
    return this.guild.shard.client._formatImage(Endpoints.GUILD_AVATAR(this.guild.id, this.id, this.avatar), format, size);
  }
  /**
   * Edit the guild member
   * @arg {Object} options The properties to edit
   * @arg {String?} [options.channelID] The ID of the voice channel to move the member to (must be in voice). Set to `null` to disconnect the member
   * @arg {Date?} [options.communicationDisabledUntil] When the user's timeout should expire. Set to `null` to instantly remove timeout
   * @arg {Boolean} [options.deaf] Server deafen the user
   * @arg {Boolean} [options.mute] Server mute the user
   * @arg {String} [options.nick] Set the user's server nickname, "" to remove
   * @arg {Array<String>} [options.roles] The array of role IDs the user should have
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  edit(options: RESTPatchAPIGuildMemberJSONBody, reason?: string) {
    return this.guild.shard.client.editGuildMember(this.guild.id, this.id, options, reason);
  }

  /**
   * Kick the member from the guild
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  kick(reason?: string) {
    return this.guild.shard.client.kickGuildMember(this.guild.id, this.id, reason);
  }

  /**
   * Remove a role from the guild member
   * @arg {String} roleID The ID of the role
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  removeRole(roleID: string, reason?: string) {
    return this.guild.shard.client.removeGuildMemberRole(this.guild.id, this.id, roleID, reason);
  }

  /**
   * Unban the user from the guild
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  unban(reason?: string) {
    return this.guild.shard.client.unbanGuildMember(this.guild.id, this.id, reason);
  }

  toJSON(props = []) {
    return super.toJSON(['activities', 'communicationDisabledUntil', 'joinedAt', 'nick', 'pending', 'premiumSince', 'roles', 'status', 'user', 'voiceState', ...props]);
  }
}
