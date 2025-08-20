/* eslint-disable @typescript-eslint/method-signature-style */
import type { RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIApplicationGuildCommandsJSONBody } from 'discord-api-types/v10';
import type CommandBuilder from '../builders/CommandBuilder';
import Base from '../structures/Base';
import type CommandInteraction from '../structures/CommandInteraction';
import type ModalSubmitInteraction from '../structures/ModalSubmitInteraction';
import type AutocompleteInteraction from '../structures/AutocompleteInteraction';
import type ComponentInteraction from '../structures/ComponentInteraction';

interface Command<Context, FetchedData = any> {
  handleCommand(context: Context, interaction: CommandInteraction, fetchedData?: FetchedData): Promise<any> | any;
  handleModal(context: Context, interaction: ModalSubmitInteraction, fetchedData?: FetchedData): Promise<any> | any;
  handleAutocomplete(context: Context, interaction: AutocompleteInteraction, fetchedData?: FetchedData): Promise<any> | any;
  handleComponent(context: Context, interaction: ComponentInteraction, fetchedData?: FetchedData): Promise<any> | any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Command<Context, FetchedData = any> extends Base {
  /**
   * Definition for the command whether it be a builder or straight JSON
   *
   * @type {(CommandBuilder | RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody)}
   * @memberof Command
   */
  definition?: CommandBuilder | RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody;
  /**
   * If populated this command will only be deployed to the guilds listed in this array
   *
   * @type {string[]}
   * @memberof Command
   */
  guilds?: string[];
  /**
   * Should this command only be ran by devs
   *
   * @type {boolean}
   * @memberof Command
   */
  developerOnly?: boolean;
  /**
   * Array of permissions the user has to have to run the command
   *
   * @type {bigint[]}
   * @memberof Command
   */
  userPermissions?: bigint[];
  /**
   * Array of users allowed to run this command
   *
   * @type {string[]}
   * @memberof Command
   */
  users?: string[];
  /**
   * Cooldown 🥶 (seconds)
   *
   * @type {number}
   * @memberof Command
   */
  cooldown?: number;

  /**
   * Should the client run the fetch data function for this command
   *
   * @memberof Command
   */
  fetchData = { command: true, modal: true, component: true, autocomplete: false };

  get command() {
    return this.id;
  }
}

export default Command;
