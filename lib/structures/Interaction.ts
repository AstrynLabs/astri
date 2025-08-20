'use strict';

import Base from './Base';
import type Client from '../Client';
import type { APIAllowedMentions, APIAuthorizingIntegrationOwnersMap, APIEmbed, APIInteraction, APIInteractionResponseCallbackData, APIModalInteractionResponseCallbackData, InteractionContextType, RESTPatchAPIWebhookWithTokenMessageJSONBody, RESTPostAPIWebhookWithTokenJSONBody } from 'discord-api-types/v10';
import { InteractionResponseType, InteractionType, MessageFlags } from 'discord-api-types/v10';
import type { FileType } from '../rest/RequestHandler';
import type CommandInteraction from './CommandInteraction';
import type AutocompleteInteraction from './AutocompleteInteraction';
import type ModalSubmitInteraction from './ModalSubmitInteraction';
import type ComponentInteraction from './ComponentInteraction';
import type PingInteraction from './PingInteraction';
import Entitlement from './Entitlement';
import type Guild from './Guild';

/**
 * Represents an interaction. You also probably want to look at PingInteraction, CommandInteraction, ComponentInteraction, AutocompleteInteraction, ModalSubmitInteraction, and UnknownInteraction.
 * @prop {Boolean} acknowledged Whether or not the interaction has been acknowledged
 * @prop {String} applicationID The ID of the interaction's application
 * @prop {String} id The ID of the interaction
 * @prop {String} token The interaction token (Interaction tokens are valid for 15 minutes after initial response and can be used to send followup messages but you must send an initial response within 3 seconds of receiving the event. If the 3 second deadline is exceeded, the token will be invalidated.)
 * @prop {Number} type 1 is a Ping, 2 is an Application Command, 3 is a Message Component, 4 is a Modal Submit
 * @prop {Number} version The interaction version
 */
export default class Interaction extends Base {
  applicationID: string;
  token: string;
  type: InteractionType;
  version: number;
  acknowledged = false;
  entitlements: Entitlement[];
  readonly _client: Client;
  guild: Guild | null = null;
  authorizing_integration_owners: APIAuthorizingIntegrationOwnersMap;
  context: InteractionContextType | null;

  constructor(data: APIInteraction, client: Client) {
    super(data.id);

    this.applicationID = data.application_id;
    this.token = data.token;
    this.type = data.type;
    this.version = data.version;
    this.entitlements = data.entitlements.map((entitlement) => new Entitlement(entitlement, client));
    this._client = client;

    this.authorizing_integration_owners = data.authorizing_integration_owners;
    if (data.context) {
      this.context = data.context;
    } else this.context = null;
  }

  update(): void {
    this.acknowledged = true;
  }

  isCommand(): this is CommandInteraction {
    return this.type === InteractionType.ApplicationCommand;
  }

  isAutocomplete(): this is AutocompleteInteraction {
    return this.type === InteractionType.ApplicationCommandAutocomplete;
  }

  isModal(): this is ModalSubmitInteraction {
    return this.type === InteractionType.ModalSubmit;
  }

  isComponent(): this is ComponentInteraction {
    return this.type === InteractionType.MessageComponent;
  }

  isPing(): this is PingInteraction {
    return this.type === InteractionType.Ping;
  }

  /**
   * App must have monetization enabled to use premium required type
   *
   * @return {*}
   * @memberof Interaction
   */
  premiumRequired() {
    if (this.acknowledged) {
      throw new Error('You have already acknowledged this interaction.');
    }
    return this._client
      .createInteractionResponse(this.id, this.token, {
        type: InteractionResponseType.PremiumRequired
      })
      .then(() => this.update());
  }

  /**
   * Acknowledge the interaction and update later. Shows loading state
   *
   * @param {boolean} [ephemeral]
   * @return {*}
   * @memberof Interaction
   */
  defer(ephemeral?: boolean) {
    if (this.acknowledged) {
      throw new Error('You have already acknowledged this interaction.');
    }
    return this._client
      .createInteractionResponse(this.id, this.token, {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
        data: {
          flags: ephemeral ? MessageFlags.Ephemeral : undefined
        }
      })
      .then(() => this.update());
  }

  createFollowup(content: RESTPostAPIWebhookWithTokenJSONBody & { embed?: APIEmbed; file?: FileType }) {
    if (!this.acknowledged) {
      throw new Error('createFollowup cannot be used to acknowledge an interaction, please use acknowledge, createMessage, or defer first.');
    }
    content.allowed_mentions = this._client._formatAllowedMentions(content.allowed_mentions);
    return this._client.executeWebhook(this.applicationID, this.token, Object.assign({ wait: true }, content));
  }

  createMessage(content: APIInteractionResponseCallbackData, file?: FileType) {
    if (this.acknowledged) {
      return this.createFollowup({ ...content, file });
    }

    content.allowed_mentions = this._client._formatAllowedMentions(content.allowed_mentions);
    return this._client
      .createInteractionResponse(
        this.id,
        this.token,
        {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: content
        },
        file
      )
      .then(() => this.update());
  }

  sendMessage(content: string, options: { allowedMentions?: APIAllowedMentions; file?: FileType; ephemeral?: boolean } = {}) {
    return this.createMessage({ content, allowed_mentions: options.allowedMentions, flags: options.ephemeral ? MessageFlags.Ephemeral : undefined }, options.file);
  }

  sendEmbed(embed: APIEmbed, options: { file?: FileType; ephemeral?: boolean } = {}) {
    return this.createMessage({ embeds: [embed], flags: options.ephemeral ? MessageFlags.Ephemeral : undefined }, options.file);
  }

  sendEmbeds(embeds: APIEmbed[], options: { file?: FileType; ephemeral?: boolean } = {}) {
    return this.createMessage({ embeds, flags: options.ephemeral ? MessageFlags.Ephemeral : undefined }, options.file);
  }

  createModal(content: APIModalInteractionResponseCallbackData) {
    return this._client
      .createInteractionResponse(this.id, this.token, {
        type: InteractionResponseType.Modal,
        data: content
      })
      .then(() => this.update());
  }

  deleteMessage(messageID: string | '@original') {
    if (!this.acknowledged) {
      throw new Error('deleteMessage cannot be used to acknowledge an interaction, please use acknowledge, createMessage, or defer first.');
    }
    return this._client.deleteWebhookMessage(this.applicationID, this.token, messageID);
  }

  deleteOriginalMessage() {
    if (!this.acknowledged) {
      throw new Error('deleteOriginalMessage cannot be used to acknowledge an interaction, please use acknowledge, createMessage, or defer first.');
    }
    return this._client.deleteWebhookMessage(this.applicationID, this.token, '@original');
  }

  editMessage(messageID: string | '@original', content: RESTPatchAPIWebhookWithTokenMessageJSONBody & { embed?: APIEmbed; file?: FileType }) {
    if (!this.acknowledged) {
      throw new Error('editMessage cannot be used to acknowledge an interaction, please use acknowledge, createMessage, or defer first.');
    }
    return this._client.editWebhookMessage(this.applicationID, this.token, messageID, content);
  }

  editOriginalMessage(content: RESTPatchAPIWebhookWithTokenMessageJSONBody & { embed?: APIEmbed; file?: FileType }) {
    if (!this.acknowledged) {
      throw new Error('editOriginalMessage cannot be used to acknowledge an interaction, please use acknowledge, createMessage, or defer first.');
    }

    return this._client.editWebhookMessage(this.applicationID, this.token, '@original', content);
  }
  getOriginalMessage() {
    if (!this.acknowledged) {
      throw new Error('getOriginalMessage cannot be used to acknowledge an interaction, please use acknowledge, createMessage, or defer first.');
    }
    return this._client.getWebhookMessage(this.applicationID, this.token, '@original');
  }

  editParent(content: APIInteractionResponseCallbackData, file?: FileType) {
    if (this.acknowledged) {
      return this.editOriginalMessage(content);
    }

    return this._client
      .createInteractionResponse(
        this.id,
        this.token,
        {
          type: InteractionResponseType.UpdateMessage,
          data: content
        },
        file
      )
      .then(() => this.update());
  }
}
