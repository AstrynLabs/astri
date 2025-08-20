'use strict';

import Interaction from './Interaction';
import Message from './Message';
import { InteractionResponseType, type APIModalSubmitInteraction } from 'discord-api-types/v10';
import type Client from '../Client';
import { type ChannelTypes } from '../interfaces/Types';
import ChannelFactory from '../factories/ChannelFactory';
import type Guild from './Guild';
import type Member from './Member';
import type User from './User';

/**
 * Represents a modal submit interaction. See Interaction for more properties
 * @extends Interaction
 * @prop {PrivateChannel | TextChannel | NewsChannel} channel The channel the interaction was created in. Can be partial with only the id if the channel is not cached
 * @prop {Object} data The data attached to the interaction
 * @prop {String} data.custom_id The ID of the Modal
 * @prop {Array<Object>} data.components The values submitted by the user
 * @prop {String?} guildID The ID of the guild in which the interaction was created
 * @prop {Member?} member The member who triggered the interaction (This is only sent when the interaction is invoked within a guild)
 * @prop {User?} user The user who triggered the interaction (This is only sent when the interaction is invoked within a dm)
 */
export default class ModalSubmitInteraction extends Interaction {
  channel: ChannelTypes | null = null;
  guild: Guild | null = null;
  member: Member | null = null;
  user?: User | null = null;
  message: Message | null = null;
  data: APIModalSubmitInteraction['data'];
  constructor(data: APIModalSubmitInteraction, client: Client) {
    super(data, client);

    this.channel = data.channel?.id ? this._client.getChannel(data.channel?.id) ?? ChannelFactory.create(data.channel, this._client) : null;

    this.data = data.data;

    if ('guild_id' in data && data.guild_id !== undefined) {
      this.guild = this._client.guilds.get(data.guild_id) ?? null;
    }

    if ('member' in data && data.member !== undefined) {
      // @ts-expect-error -- id
      data.member.id = data.member.user.id;
      // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
      if (this.guild) this.member = this.guild.members.update(data.member, this.guild);
      this.user = this._client.users.update(data.member.user, this._client);
    }

    if (data.message !== undefined) {
      this.message = new Message(data.message, this._client);
    }

    if ('user' in data && data.user !== undefined) {
      this.user = this._client.users.update(data.user, client);
    }

    // ? If at this point the user is undefined then we can try pulling it from the authorizing_integration_owners object since its likely to be a user scoped integration
    if (this.user === undefined) {
      const userID = this.authorizing_integration_owners['1'];
      if (userID !== undefined) {
        this.user = this._client.users.get(userID);
      }
    }
  }

  /**
   * Acknowledge the modal interaction and edit the message component is attached to later
   *
   * @return {*}
   * @memberof ModalSubmitInteraction
   */
  deferUpdate() {
    if (this.acknowledged) {
      throw new Error('You have already acknowledged this interaction.');
    }
    return this._client
      .createInteractionResponse(this.id, this.token, {
        type: InteractionResponseType.DeferredMessageUpdate
      })
      .then(() => this.update());
  }

  get fields() {
    return this.data.components.flatMap((row) => row.components);
  }
}
