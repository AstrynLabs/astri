/* eslint-disable @typescript-eslint/naming-convention */
import { ApplicationIntegrationType, InteractionContextType, type RESTPostAPIChatInputApplicationCommandsJSONBody, type RESTPostAPIApplicationGuildCommandsJSONBody, type ApplicationCommandType, type APIApplicationCommandOption, ApplicationCommandOptionType, type APIApplicationCommandStringOption, type APIApplicationCommandIntegerOption, type APIApplicationCommandNumberOption, type Permissions, type APIApplicationCommandSubcommandGroupOption, type APIApplicationCommandSubcommandOption, type ChannelType, type LocalizationMap } from 'discord-api-types/v10';
import PermissionBitfield from '../util/PermissionBitfield';

/**
 * Allows you to easily build commands, build your commands then when your done convert it to api friendly json with toJSON()
 *
 * @export
 * @class CommandBuilder
 */
export default class CommandBuilder {
  /**
   * The type of command (CHAT_INPUT, USER, MESSAGE)
   *
   * @type {ApplicationCommandType}
   * @memberof CommandBuilder
   */
  type?: ApplicationCommandType;

  /**
   * The integration type of the command 0 for guild install and 1 for user install
   *
   * @type {ApplicationIntegrationType[]}
   * @memberof CommandBuilder
   */
  integration_types?: ApplicationIntegrationType[];
  /**
   * The context of the command
   *
   * @type {InteractionContextType[]}
   * @memberof CommandBuilder
   */
  contexts?: InteractionContextType[];
  /**
   * The Option Type for this option (SUB_COMMAND, SUB_COMMAND_GROUP, STRING, INTEGER, BOOLEAN, USER, CHANNEL, ROLE, MENTIONABLE, NUMBER, ATTACHMENT)
   *
   * @type {ApplicationCommandOptionType}
   * @memberof CommandBuilder
   */
  optionType?: ApplicationCommandOptionType;
  /**
   * The name of the command/option
   *
   * @type {string}
   * @memberof CommandBuilder
   */
  name: string;
  /**
   * The description of the command/option
   *
   * @type {string}
   * @memberof CommandBuilder
   */
  description: string;
  /**
   * The options for this command/option
   *
   * @type {(Array<APIApplicationCommandOption | CommandBuilder>)}
   * @memberof CommandBuilder
   */
  options: Array<APIApplicationCommandOption | CommandBuilder> = [];
  /**
   * The default permissions for this command
   *
   * @type {(Permissions | null)}
   * @memberof CommandBuilder
   */
  default_member_permissions?: Permissions | null;
  /**
   * Whether this command is allowed in DMs
   *
   * @type {boolean}
   * @deprecated Use `contexts` instead
   * @memberof CommandBuilder
   */
  dm_permission?: boolean;
  /**
   * Whether this command is NSFW
   *
   * @memberof CommandBuilder
   */
  nsfw = false;

  /**
   * Name of the command Localized
   *
   * @memberof CommandBuilder
   */
  name_localizations: LocalizationMap;

  /**
   * Command Description Localizations
   *
   * @memberof CommandBuilder
   */
  description_localizations: LocalizationMap;

  /**
   * Creates an instance of CommandBuilder.
   * @param {string} name The name of the command
   * @param {string} description The description of the command
   * @memberof CommandBuilder
   */
  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  /**
   * Add localizations for the command name
   *
   * @param {LocalizationMap} localizations
   * @return {CommandBuilder}
   * @memberof CommandBuilder
   */
  setNameLocalizations(localizations: LocalizationMap) {
    this.name_localizations = localizations;
    return this;
  }

  /**
   * Add localizations for the command description
   *
   * @param {LocalizationMap} localizations
   * @return {CommandBuilder}
   * @memberof CommandBuilder
   */
  setDescriptionLocalizations(localizations: LocalizationMap) {
    this.description_localizations = localizations;
    return this;
  }
  /**
   * Adds a subcommand group to the command
   *
   * @param {string} name
   * @param {string} description
   * @param {(builder: CommandBuilder) => void} [callback]
   * @return {CommandBuilder}
   * @memberof CommandBuilder
   */
  addSubcommandGroup(name: string, description: string, callback?: (builder: CommandBuilder) => void) {
    const builder = new CommandBuilder(name, description);
    builder.optionType = ApplicationCommandOptionType.SubcommandGroup;
    this.options.push(builder);
    if (callback) callback(builder);
    return this;
  }
  /**
   * Adds a subcommand to the command
   *
   * @param {string} name
   * @param {string} description
   * @param {(builder: CommandBuilder) => void} [callback]
   * @return {CommandBuilder}
   * @memberof CommandBuilder
   */
  addSubcommand(name: string, description: string, callback?: (builder: CommandBuilder) => void) {
    const builder = new CommandBuilder(name, description);
    builder.optionType = ApplicationCommandOptionType.Subcommand;
    this.options.push(builder);
    if (callback) callback(builder);
    return this;
  }
  /**
   * Adds a string option to the command
   *
   * @param {({ name: string; description: string; required?: boolean; autocomplete?: boolean; choices?: Array<string | { name: string; value: string }>; min_length?: number; max_length?: number })} { name, description, required, autocomplete, choices, min_length, max_length }
   * @return {*}
   * @memberof CommandBuilder
   */
  addStringOption({ name, description, required, autocomplete, choices, min_length, max_length }: { name: string; description: string; required?: boolean; autocomplete?: boolean; choices?: Array<string | { name: string; value: string }>; min_length?: number; max_length?: number }) {
    if (choices && choices.length > 25) throw new TypeError('Choices cannot be greater than 25');
    const option: APIApplicationCommandStringOption = {
      type: ApplicationCommandOptionType.String,
      name,
      description,
      required,
      autocomplete: choices?.length ? false : autocomplete,
      min_length,
      max_length
    };

    if (choices) option.choices = choices ? choices.map((choice) => (typeof choice === 'string' ? { name: choice, value: choice.replace(/ /g, '_').toLowerCase() } : choice)) : undefined;
    this.options.push(option);

    return this;
  }

  /**
   * Adds an integer option to the command
   *
   * @param {{ name: string; description: string; required?: boolean; autocomplete?: boolean; choices?: Array<{ name: string; value: number }>; min_value?: number; max_value?: number }} { name, description, required, autocomplete, choices, min_value, max_value }
   * @return {*}
   * @memberof CommandBuilder
   */
  addIntegerOption({ name, description, required, autocomplete, choices, min_value, max_value }: { name: string; description: string; required?: boolean; autocomplete?: boolean; choices?: Array<{ name: string; value: number }>; min_value?: number; max_value?: number }) {
    if (choices && choices.length > 25) throw new TypeError('Choices cannot be greater than 25');
    const option: APIApplicationCommandIntegerOption = {
      type: ApplicationCommandOptionType.Integer,
      name,
      description,
      required,
      autocomplete: choices?.length ? false : autocomplete,
      min_value,
      max_value
    };

    if (choices) option.choices = choices;
    this.options.push(option);

    return this;
  }

  /**
   * Adds a number option to the command
   *
   * @param {{ name: string; description: string; required?: boolean; autocomplete?: boolean; choices?: Array<{ name: string; value: number }>; min_value?: number; max_value?: number }} { name, description, required, autocomplete, choices, min_value, max_value }
   * @return {*}
   * @memberof CommandBuilder
   */
  addNumberOption({ name, description, required, autocomplete, choices, min_value, max_value }: { name: string; description: string; required?: boolean; autocomplete?: boolean; choices?: Array<{ name: string; value: number }>; min_value?: number; max_value?: number }) {
    if (choices && choices.length > 25) throw new TypeError('Choices cannot be greater than 25');
    const option: APIApplicationCommandNumberOption = {
      type: ApplicationCommandOptionType.Number,
      name,
      description,
      required,
      autocomplete: choices?.length ? false : autocomplete,
      min_value,
      max_value
    };

    if (choices) option.choices = choices;
    this.options.push(option);

    return this;
  }

  /**
   * Adds a boolean option to the command
   *
   * @param {string} name
   * @param {string} description
   * @param {boolean} [required=false]
   * @return {*}
   * @memberof CommandBuilder
   */
  addBooleanOption(name: string, description: string, required: boolean = false) {
    this.options.push({
      type: ApplicationCommandOptionType.Boolean,
      name,
      description,
      required
    });

    return this;
  }

  /**
   * Adds a user option to the command
   *
   * @param {string} name
   * @param {string} description
   * @param {boolean} [required=false]
   * @return {*}
   * @memberof CommandBuilder
   */
  addUserOption(name: string, description: string, required: boolean = false) {
    this.options.push({
      type: ApplicationCommandOptionType.User,
      name,
      description,
      required
    });

    return this;
  }

  /**
   * Adds a channel option to the command
   *
   * @param {string} name
   * @param {string} description
   * @param {boolean} [required=false]
   * @return {*}
   * @memberof CommandBuilder
   */
  addChannelOption(name: string, description: string, required: boolean = false, types: Exclude<ChannelType, ChannelType.DM | ChannelType.GroupDM | ChannelType.GuildDirectory>[] = []) {
    this.options.push({
      type: ApplicationCommandOptionType.Channel,
      name,
      description,
      required,
      channel_types: types
    });

    return this;
  }

  /**
   * Adds a role option to the command
   *
   * @param {string} name
   * @param {string} description
   * @param {boolean} [required=false]
   * @return {*}
   * @memberof CommandBuilder
   */
  addRoleOption(name: string, description: string, required: boolean = false) {
    this.options.push({
      type: ApplicationCommandOptionType.Role,
      name,
      description,
      required
    });

    return this;
  }

  /**
   * Adds a mentionable option to the command
   *
   * @param {string} name
   * @param {string} description
   * @param {boolean} [required=false]
   * @return {*}
   * @memberof CommandBuilder
   */
  addMentionOption(name: string, description: string, required: boolean = false) {
    this.options.push({
      type: ApplicationCommandOptionType.Mentionable,
      name,
      description,
      required
    });

    return this;
  }

  /**
   * Adds an attachment option to the command
   *
   * @param {string} name
   * @param {string} description
   * @param {boolean} [required=false]
   * @return {*}
   * @memberof CommandBuilder
   */
  addAttachmentOption(name: string, description: string, required: boolean = false) {
    this.options.push({
      type: ApplicationCommandOptionType.Attachment,
      name,
      description,
      required
    });

    return this;
  }

  /**
   * Sets whether this command is allowed in DMs
   *
   * @param {boolean} allow
   * @return {*}
   * @deprecated Use `setContexts` instead
   * @memberof CommandBuilder
   */
  setDMPermission(allow: boolean) {
    this.dm_permission = allow;
    return this;
  }

  /**
   * Sets the places that you can use a command, default is everywhere
   *
   * @param {InteractionContextType | InteractionContextType[]} contexts
   * @return {*}
   * @memberof CommandBuilder
   */
  setContexts(contexts: InteractionContextType | InteractionContextType[]) {
    this.contexts = Array.isArray(contexts) ? contexts : [contexts];
    return this;
  }

  /**
   * Sets the default permissions for this command
   *
   * @param {(PermissionBitfield | Permissions | number | bigint | null)} permission
   * @return {*}
   * @memberof CommandBuilder
   */
  setMemberPermission(permission: PermissionBitfield | Permissions | number | bigint | null) {
    this.default_member_permissions = permission ? (permission instanceof PermissionBitfield ? permission.bits.toString() : permission.toString()) : null;
    return this;
  }

  /**
   * Sets whether this command is NSFW
   *
   * @param {boolean} nsfw
   * @return {*}
   * @memberof CommandBuilder
   */
  setNSFW(nsfw: boolean) {
    this.nsfw = nsfw;
    return this;
  }

  /**
   * Sets whether this command is a slash, user context, or message context command
   *
   * @param {ApplicationCommandType} type
   * @return {*}
   * @memberof CommandBuilder
   */
  setCommandType(type: ApplicationCommandType) {
    this.type = type;
    return this;
  }

  /**
   * Set where this command can be installed to
   *
   * @param {ApplicationIntegrationType | ApplicationIntegrationType[]} types
   * @return {*}
   * @memberof CommandBuilder
   */
  setIntegrationTypes(types: ApplicationIntegrationType | ApplicationIntegrationType[]) {
    this.integration_types = Array.isArray(types) ? types : [types];
    return this;
  }

  /**
   * Converts the command to api friendly json
   *
   * @return {RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody | APIApplicationCommandOption | Record<any, any>}  {(RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody | APIApplicationCommandOption | Record<any, any>)}
   * @memberof CommandBuilder
   */
  toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody | APIApplicationCommandOption | Record<any, any> {
    if (this.type !== undefined) {
      return {
        type: this.type,
        integration_types: this.integration_types ?? [ApplicationIntegrationType.GuildInstall],
        contexts: this.contexts ?? [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
        name: this.name,
        description: this.description,
        name_localizations: this.name_localizations ?? undefined,
        description_localizations: this.description_localizations ?? undefined,
        options: this.options.map((option) => (option instanceof CommandBuilder ? option.toJSON() : option)),
        default_member_permissions: this.default_member_permissions,
        dm_permission: this.dm_permission,
        nsfw: this.nsfw
      };
    } else if (this.optionType === ApplicationCommandOptionType.SubcommandGroup) {
      const group: APIApplicationCommandSubcommandGroupOption = {
        type: this.optionType,
        name: this.name,
        name_localizations: this.name_localizations ?? undefined,
        description_localizations: this.description_localizations ?? undefined,
        description: this.description,
        options: this.options.map((option) => (option instanceof CommandBuilder ? option.toJSON() : option))
      };

      return group;
    } else if (this.optionType === ApplicationCommandOptionType.Subcommand) {
      const command: APIApplicationCommandSubcommandOption = {
        type: this.optionType,
        name: this.name,
        name_localizations: this.name_localizations ?? undefined,
        description_localizations: this.description_localizations ?? undefined,
        description: this.description,
        options: this.options.map((option) => (option instanceof CommandBuilder ? option.toJSON() : option))
      };

      return command;
    }
    return {};
  }
}
