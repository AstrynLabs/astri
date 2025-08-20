'use strict';

import type Client from '../Client';
import { InteractionResponseType, type APIApplicationCommandAutocompleteInteraction, type APIApplicationCommandOptionChoice, ApplicationCommandOptionType, type APIApplicationCommandInteractionDataStringOption, type APIApplicationCommandInteractionDataIntegerOption, type APIApplicationCommandInteractionDataNumberOption, type APIApplicationCommandInteractionDataBasicOption, ApplicationCommandType } from 'discord-api-types/v10';
import Interaction from './Interaction';
import type { ChannelTypes } from '../interfaces/Types';
import ChannelFactory from '../factories/ChannelFactory';
import type Guild from './Guild';
import type Member from './Member';
import type User from './User';
import PermissionBitfield from '../util/PermissionBitfield';

/**
 * Represents an application command autocomplete interaction. See Interaction for more properties.
 *
 * @export
 * @class AutocompleteInteraction
 * @extends {Interaction}
 */
export default class AutocompleteInteraction extends Interaction {
  _client: Client;
  /**
   * The channel the interaction was created in. Can be partial with only the id if the channel is not cached
   *
   * @type {(ChannelTypes | null)}
   * @memberof AutocompleteInteraction
   */
  channel: ChannelTypes | null = null;
  /**
   *  The guild the interaction was created in. Can be partial with only the id if the guild is not cached
   *
   * @type {(Guild | null)}
   * @memberof AutocompleteInteraction
   */
  guild: Guild | null = null;
  /**
   * The member who triggered the interaction (This is only sent when the interaction is invoked within a guild)
   *
   * @type {(Member | null)}
   * @memberof AutocompleteInteraction
   */
  member: Member | null = null;
  /**
   * The user who triggered the interaction (This is only sent when the interaction is invoked within a dm)
   *
   * @type {(User | null)}
   * @memberof AutocompleteInteraction
   */
  user?: User | null = null;
  /**
   * The data attached to the interaction
   *
   * @type {APIApplicationCommandAutocompleteInteraction['data']}
   * @memberof AutocompleteInteraction
   */
  data: APIApplicationCommandAutocompleteInteraction['data'];
  /**
   * The permissions the app or bot has within the channel the interaction was sent from
   *
   * @type {(PermissionBitfield | null)}
   * @memberof AutocompleteInteraction
   */
  appPermissions: PermissionBitfield;
  command: string;
  group: string | null = null;
  subcommand: string | null = null;
  options: APIApplicationCommandInteractionDataBasicOption[] = [];
  constructor(data: APIApplicationCommandAutocompleteInteraction, client: Client) {
    super(data, client);

    this._client = client;

    this.channel = data.channel?.id ? (this._client.getChannel(data.channel?.id) ?? ChannelFactory.create({ id: data.channel?.id }, client)) : null;

    this.data = data.data;

    this.command = this.data.name;
    if (this.data.type === ApplicationCommandType.ChatInput) {
      if (this.data.options?.[0].type === ApplicationCommandOptionType.SubcommandGroup) {
        this.group = this.data.options[0].name;
        if (this.data.options[0].options[0].type === ApplicationCommandOptionType.Subcommand) {
          this.subcommand = this.data.options[0].options[0].name;
          this.options = this.data.options[0].options[0].options ?? [];
        }
      } else if (this.data.options?.[0].type === ApplicationCommandOptionType.Subcommand) {
        this.subcommand = this.data.options[0].name;
        this.options = this.data.options[0].options ?? [];
      } else this.options = (this.data.options as APIApplicationCommandInteractionDataBasicOption[]) ?? [];
    }

    if (data.guild_id !== undefined) {
      this.guild = client.guilds.get(data.guild_id) ?? null;
    }

    if (data.member !== undefined) {
      // @ts-expect-error -- id
      data.member.id = data.member.user.id;
      // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
      if (this.guild) this.member = this.guild.members.update(data.member, this.guild);
      this.user = this._client.users.update(data.member.user, this._client);
    }

    if (data.user !== undefined) {
      this.user = this._client.users.update(data.user, client);
    }

    // ? If at this point the user is undefined then we can try pulling it from the authorizing_integration_owners object since its likely to be a user scoped integration
    if (this.user === undefined) {
      const userID = this.authorizing_integration_owners['1'];
      if (userID !== undefined) {
        this.user = this._client.users.get(userID);
      }
    }

    this.appPermissions = new PermissionBitfield(data.app_permissions);
  }

  /**
   * Acknowledge a Autocomplete with the choices array that match a user's input
   *
   * @param {APIApplicationCommandOptionChoice[]} choices
   * @return {*}
   * @memberof AutocompleteInteraction
   */
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

  /**
   * Gets the focused option of the autocomplete interaction.
   *
   * @return {APIApplicationCommandInteractionDataStringOption | APIApplicationCommandInteractionDataIntegerOption | APIApplicationCommandInteractionDataNumberOption | null}
   * @memberof AutocompleteInteraction
   */
  focused() {
    return this.options.find((option) => (option as APIApplicationCommandInteractionDataStringOption | APIApplicationCommandInteractionDataIntegerOption | APIApplicationCommandInteractionDataNumberOption).focused) ?? null;
  }

  getOption<T>(arg: string, type: ApplicationCommandOptionType, required?: boolean): T | null {
    const value = this.options.find((option) => option.name === arg && option.type === type);
    if (value) return value.value as T;
    if (required) throw new TypeError(`Option ${arg} is null or undefined`);
    return null;
  }
}
