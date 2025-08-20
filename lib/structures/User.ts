'use strict';

import Endpoints from '../rest/Endpoints';
import { type APIUser, ImageFormat } from 'discord-api-types/v10';
import type Client from '../Client';
import type PrivateChannel from './PrivateChannel';
import PartialUser from './PartialUser';

/**
 * Represents a user
 * @prop {Number?} accentColor The user's banner color, or null if no banner color (REST only)
 * @prop {String?} avatar The hash of the user's avatar, or null if no avatar
 * @prop {String} avatarURL The URL of the user's avatar which can be either a JPG or GIF
 * @prop {String?} banner The hash of the user's banner, or null if no banner (REST only)
 * @prop {String?} bannerURL The URL of the user's banner
 * @prop {Boolean} bot Whether the user is an OAuth bot or not
 * @prop {Number} createdAt Timestamp of the user's creation
 * @prop {String} defaultAvatar The hash for the default avatar of a user if there is no avatar set
 * @prop {String} defaultAvatarURL The URL of the user's default avatar
 * @prop {String} discriminator The discriminator of the user
 * @prop {String} global_name The non-unique display name of the user
 * @prop {String} id The ID of the user
 * @prop {String} mention A string that mentions the user
 * @prop {Number?} publicFlags Publicly visible flags for this user
 * @prop {String} staticAvatarURL The URL of the user's avatar (always a JPG)
 * @prop {Boolean} system Whether the user is an official Discord system user (e.g. urgent messages)
 * @prop {String} username The username of the user
 */
export default class User extends PartialUser {
  bot: boolean;
  system: boolean;
  avatar: string | null;
  username: string;
  discriminator: string;
  global_name: string | null;
  publicFlags: APIUser['public_flags'];
  banner: string | null;
  accentColor: number | null;
  constructor(data: APIUser, client?: Client) {
    super(data, client);

    this.bot = !!data.bot;
    this.system = !!data.system;
    this.update(data);
  }

  update(data: APIUser): void {
    if (data.avatar !== undefined) {
      this.avatar = data.avatar;
    }
    if (data.username !== undefined) {
      this.username = data.username;
    }
    if (data.discriminator !== undefined) {
      this.discriminator = data.discriminator;
    }
    if (data.global_name !== undefined) {
      this.global_name = data.global_name;
    }
    if (data.public_flags !== undefined) {
      this.publicFlags = data.public_flags;
    }
    if (data.banner !== undefined) {
      this.banner = data.banner;
    }
    if (data.accent_color !== undefined) {
      this.accentColor = data.accent_color;
    }
  }

  get avatarURL(): string {
    if (this._missingClientError ?? !this._client) {
      throw this._missingClientError!;
    }
    return this.avatar ? this._client._formatImage(Endpoints.USER_AVATAR(this.id, this.avatar)) : this.defaultAvatarURL;
  }

  get bannerURL(): string | null {
    if (!this.banner) {
      return null;
    }
    if (this._missingClientError ?? !this._client) {
      throw this._missingClientError!;
    }
    return this._client._formatImage(Endpoints.BANNER(this.id, this.banner));
  }

  get defaultAvatar(): number {
    return Number(this.discriminator) % 5;
  }

  get defaultAvatarURL(): string {
    return `${Endpoints.CDN_URL}${Endpoints.DEFAULT_USER_AVATAR(this.defaultAvatar.toString())}.png`;
  }

  get mention(): string {
    return `<@${this.id}>`;
  }

  get staticAvatarURL(): string {
    if (this._missingClientError ?? !this._client) {
      throw this._missingClientError!;
    }
    return this.avatar ? this._client._formatImage(Endpoints.USER_AVATAR(this.id, this.avatar), ImageFormat.JPEG) : this.defaultAvatarURL;
  }

  displayName(useGlobal = false) {
    return this.discriminator === '0' ? (useGlobal && this.global_name ? this.global_name : this.username) : `${this.username}#${this.discriminator}`;
  }

  /**
   * Get the user's avatar with the given format and size
   * @arg {String} [format] The filetype of the avatar ("jpg", "jpeg", "png", "gif", or "webp")
   * @arg {Number} [size] The size of the avatar (any power of two between 16 and 4096)
   * @returns {String}
   */
  dynamicAvatarURL(format?: ImageFormat, size?: number): string {
    if (!this.avatar) {
      return this.defaultAvatarURL;
    }
    if (this._missingClientError ?? !this._client) {
      throw this._missingClientError!;
    }
    return this._client._formatImage(Endpoints.USER_AVATAR(this.id, this.avatar), format, size);
  }

  /**
   * Get the user's banner with the given format and size
   * @arg {String} [format] The filetype of the banner ("jpg", "jpeg", "png", "gif", or "webp")
   * @arg {Number} [size] The size of the banner (any power of two between 16 and 4096)
   * @returns {String?}
   */
  dynamicBannerURL(format?: ImageFormat, size?: number): string | null {
    if (!this.banner) {
      return null;
    }
    if (this._missingClientError ?? !this._client) {
      throw this._missingClientError!;
    }
    return this._client._formatImage(Endpoints.BANNER(this.id, this.banner), format, size);
  }

  /**
   * Get a DM channel with the user, or create one if it does not exist
   * @returns {Promise<PrivateChannel>}
   */
  getDMChannel(): Promise<PrivateChannel> {
    if (this._missingClientError ?? !this._client) {
      throw this._missingClientError!;
    }
    return this._client.getDMChannel(this.id) as Promise<PrivateChannel>;
  }

  toJSON(props = []): Record<string, any> {
    return super.toJSON(['accentColor', 'avatar', 'banner', 'bot', 'discriminator', 'publicFlags', 'system', 'username', 'global_name', ...props]);
  }
}
