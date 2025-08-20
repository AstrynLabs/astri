'use strict';

import Interaction from './Interaction';
import Message from './Message';
import type Member from './Member';
import { type APIApplicationCommandOptionChoice, type APIInteraction, InteractionResponseType } from 'discord-api-types/v10';
import type Client from '../Client';
import { type ChannelTypes } from '../interfaces/Types';
import PermissionBitfield from '../util/PermissionBitfield';
import type Guild from './Guild';
import type User from './User';
import ChannelFactory from '../factories/ChannelFactory';

/**
 * Represents an unknown interaction. See Interaction for more properties.
 * Note: Methods are not guaranteed to work properly, they are all added just in case you know which to use.
 * @extends Interaction
 * @prop {Permission?} appPermissions The permissions the app or bot has within the channel the interaction was sent from
 * @prop {(PrivateChannel | TextChannel | NewsChannel)?} channel The channel the interaction was created in. Can be partial with only the id if the channel is not cached.
 * @prop {Object?} data The data attached to the interaction
 * @prop {String?} guildID The ID of the guild in which the interaction was created
 * @prop {Member?} member The member who triggered the interaction (This is only sent when the interaction is invoked within a guild)
 * @prop {Message?} message The message the interaction came from (Message Component only). If the message is ephemeral, this will be an object with `id` and `flags` keys.
 * @prop {User?} user The user who triggered the interaction (This is only sent when the interaction is invoked within a dm)
 */
export default class UnknownInteraction extends Interaction {
  channel: ChannelTypes | null;
  guild: Guild | null = null;
  member: Member | null = null;
  user: User | null = null;
  message: Message | null = null;
  appPermissions: PermissionBitfield | null = null;
  data: APIInteraction['data'];
  constructor(data: APIInteraction, client: Client) {
    super(data, client);

    this.channel = data.channel?.id ? this._client.getChannel(data.channel?.id) ?? ChannelFactory.create(data.channel, this._client) : null;

    this.data = JSON.parse(JSON.stringify(data.data));

    if (data.guild_id !== undefined) {
      this.guild = this._client.guilds.get(data.guild_id) ?? null;
    }

    if (data.member !== undefined) {
      if (this.guild) {
        // @ts-expect-error -- id
        data.member.id = data.member.user.id;
        // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
        this.member = this.guild.members.update(data.member, this.guild);
      }
    }

    if (data.message !== undefined) {
      this.message = new Message(data.message, this._client);
    }

    if ('user' in data && data.user !== undefined) {
      this.user = this._client.users.update(data.user, client);
    }

    if (data.app_permissions !== undefined) {
      this.appPermissions = new PermissionBitfield(data.app_permissions);
    }
  }

  pong() {
    if (this.acknowledged) {
      throw new Error('You have already acknowledged this interaction.');
    }
    return this._client
      .createInteractionResponse(this.id, this.token, {
        type: InteractionResponseType.Pong
      })
      .then(() => this.update());
  }

  acknowledge(choices: APIApplicationCommandOptionChoice[]) {
    if (this.acknowledged) {
      throw new Error('You have already acknowledged this interaction.');
    }
    return this._client
      .createInteractionResponse(this.id, this.token, {
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: { choices }
      })
      .then(() => this.update());
  }
}
