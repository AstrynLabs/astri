'use strict';

import type { APIOverwrite, PermissionFlagsBits } from 'discord-api-types/v10';
import Base from './Base';
import Bitfield, { type BitType } from '../util/Bitfield';

/**
 * Represents a permission overwrite
 * @extends Permission
 * @prop {String} id The ID of the overwrite
 * @prop {Number} type The type of the overwrite, either 1 for "member" or 0 for "role"
 */
export default class PermissionOverwrite extends Base {
  allow: Bitfield<typeof PermissionFlagsBits>;
  deny: Bitfield<typeof PermissionFlagsBits>;
  type: APIOverwrite['type'];
  constructor(data: APIOverwrite) {
    super(data.id);
    this.type = data.type;
    this.allow = new Bitfield(data.allow);
    this.deny = new Bitfield(data.deny);
  }

  has(bit: BitType<typeof PermissionFlagsBits>) {
    return this.allow.has(bit);
  }

  toJSON(props = []): Record<string, any> {
    return super.toJSON(['type', 'allow', 'deny', ...props]);
  }
}
