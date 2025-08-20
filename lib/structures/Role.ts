'use strict';

import type Guild from './Guild';
import Base from './Base';
import Endpoints from '../rest/Endpoints';
import type { APIRole, RESTPatchAPIGuildRoleJSONBody } from 'discord-api-types/v10';
import PermissionBitfield from '../util/PermissionBitfield';

export default class Role extends Base {
  /**
   * The hex color of the role in base 10
   *
   * @type {number}
   * @memberof Role
   */
  color: number;

  /**
   * Whether users with this role are hoisted in the user list or not
   *
   * @type {boolean}
   * @memberof Role
   */
  hoist: boolean;

  /**
   * The hash of the role's icon, or null if no icon
   *
   * @type {string}
   * @memberof Role
   */
  icon?: string | null;

  /**
   * The guild that the role belongs to
   *
   * @type {Guild | null}
   * @memberof Role
   */
  guild: Guild | null;

  /**
   * Whether a guild integration manages this role or not
   *
   * @type {boolean}
   * @memberof Role
   */
  managed: boolean;

  /**
   * Whether the role is mentionable or not
   *
   * @type {boolean}
   * @memberof Role
   */
  mentionable: boolean;

  /**
   * The name of the role
   *
   * @type {string}
   * @memberof Role
   */
  name: string;

  /**
   * The permissions representation of the role
   *
   * @type {PermissionBitfield}
   * @memberof Role
   */
  permissions: PermissionBitfield;

  /**
   * The position of the role
   *
   * @type {number}
   * @memberof Role
   */
  position: number;

  /**
   * Tags belonging to the role
   *
   * @type {({
   *     bot_id?: string;
   *     integration_id?: string;
   *     premium_subscriber?: null | boolean;
   *     subscription_listing_id?: string;
   *     available_for_purchase?: null;
   *     guild_connections?: null;
   *   })}
   * @memberof Role
   */
  tags?: {
    /**
     * The ID of the bot associated with the role
     *
     * @type {string}
     */
    bot_id?: string;
    /**
     * The ID of the integration associated with the role
     *
     * @type {string}
     */
    integration_id?: string;
    /**
     * Whether the role is the guild's premium subscriber role
     *
     * @type {(null | boolean)}
     */
    premium_subscriber?: null | boolean;
    subscription_listing_id?: string;
    available_for_purchase?: null;
    guild_connections?: null;
  };

  /**
   * Unicode emoji for the role
   *
   * @type {string}
   * @memberof Role
   */
  unicodeEmoji?: string | null;

  constructor(data: APIRole, guild: Guild | null) {
    super(data.id);
    this.guild = guild;
    this.update(data);
  }

  /**
   * Update class props
   *
   * @param {APIRole} data
   * @memberof Role
   * @internal
   */
  update(data: APIRole): void {
    this.name = data.name;
    this.mentionable = data.mentionable;
    this.managed = data.managed;
    this.hoist = data.hoist;
    this.color = data.color;
    this.position = data.position;
    this.permissions = new PermissionBitfield(data.permissions);
    if (data.tags !== undefined) {
      this.tags = data.tags;
      if (this.tags.premium_subscriber === null) {
        this.tags.premium_subscriber = true;
      }
    }
    if (data.icon !== undefined) {
      this.icon = data.icon;
    }
    if (data.unicode_emoji !== undefined) {
      this.unicodeEmoji = data.unicode_emoji;
    }
  }

  /**
   * The CDN url for the icon
   *
   * @readonly
   * @memberof Role
   */
  get iconURL(): string | null {
    return this.icon && this.guild ? this.guild.shard.client._formatImage(Endpoints.ROLE_ICON(this.id, this.icon)) : null;
  }

  /**
   * Permissions of the role
   *
   * @readonly
   * @memberof Role
   */
  get json() {
    return this.permissions?.json;
  }

  /**
   * Formatted role mention
   *
   * @readonly
   * @memberof Role
   */
  get mention(): string {
    return `<@&${this.id}>`;
  }

  /**
   * Delete the role
   *
   * @param {string} [reason] The reason to be displayed in audit logs
   * @return {*}  {Promise<unknown>}
   * @memberof Role
   */
  delete(reason?: string) {
    if (!this.guild) throw new Error('Role missing cached guild. Rest mode?');
    return this.guild.shard.client.deleteRole(this.guild.id, this.id, reason);
  }

  /**
   * Edit the role
   *
   * @param {RoleEditOptions} options The properties to edit
   * @param {string} reason The reason to be displayed in audit logs
   * @return {*}  {Promise<unknown>}
   * @memberof Role
   */
  edit(options: RESTPatchAPIGuildRoleJSONBody, reason?: string): Promise<unknown> {
    if (!this.guild) throw new Error('Role missing cached guild. Rest mode?');
    return this.guild.shard.client.editRole(this.guild.id, this.id, options, reason);
  }

  /**
   * Edit the role's position.
   *
   * @param {number} position The new position of the role
   * @return {*}  {Promise<unknown>}
   * @memberof Role
   */
  editPosition(position: number): Promise<unknown> {
    if (!this.guild) throw new Error('Role missing cached guild. Rest mode?');
    return this.guild.shard.client.editRolePosition(this.guild.id, this.id, position);
  }

  /**
   * Compares the position of a role
   *
   * @param {Role} role
   * @return {number} Negative number if role is lower, positive if higher, 0 if equal
   * @memberof Role
   */
  comparePosition(role: Role) {
    const role1Position = this.position;
    const role2Position = role.position;

    if (role1Position === role2Position) {
      return Number(BigInt(this.id) - BigInt(role.id));
    }

    return role1Position - role2Position;
  }

  toJSON(props: string[] = []): Record<string, any> {
    return super.toJSON(['color', 'hoist', 'icon', 'managed', 'mentionable', 'name', 'permissions', 'position', 'tags', 'unicodeEmoji', ...props]);
  }
}
