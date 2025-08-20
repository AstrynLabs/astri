import type Client from '../Client';
import { type APIInteraction, InteractionType } from 'discord-api-types/v10';
import AutocompleteInteraction from '../structures/AutocompleteInteraction';
import CommandInteraction from '../structures/CommandInteraction';
import ComponentInteraction from '../structures/ComponentInteraction';
import type Interaction from '../structures/Interaction';
import ModalSubmitInteraction from '../structures/ModalSubmitInteraction';
import PingInteraction from '../structures/PingInteraction';

export default class InteractionFactory {
  static create(data: APIInteraction, client: Client): Interaction {
    switch (data.type) {
      case InteractionType.Ping: {
        return new PingInteraction(data, client);
      }
      case InteractionType.ApplicationCommand: {
        return new CommandInteraction(data, client);
      }
      case InteractionType.MessageComponent: {
        return new ComponentInteraction(data, client);
      }
      case InteractionType.ApplicationCommandAutocomplete: {
        return new AutocompleteInteraction(data, client);
      }
      case InteractionType.ModalSubmit: {
        return new ModalSubmitInteraction(data, client);
      }
    }
  }
}
