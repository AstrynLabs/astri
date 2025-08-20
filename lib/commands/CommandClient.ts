import { PermissionFlagsBits, type APIApplicationCommand, type RESTPostAPIApplicationCommandsJSONBody, type RESTPostAPIApplicationGuildCommandsJSONBody } from 'discord-api-types/v10';
import Client, { type ClientOptions } from '../Client';
import CommandBuilder from '../builders/CommandBuilder';
import Collection from '../util/Collection';
import Command from './Command';
import type Interaction from '../structures/Interaction';
import { CommandError } from '../errors/CommandError';
import { type CooldownLogic, CooldownHandler } from './CooldownHandler';
import type Events from '../interfaces/Events';
import Event from './Event';

/**
 * A client to handle most aspects of Application Commands to make creating bots easier
 *
 * @export
 * @class CommandClient
 * @extends {Client}
 * @template Context
 */
export default class CommandClient<Context = any, FetchData = any> extends Client {
  /**
   * Collection of commands registered with the client
   *
   * @memberof CommandClient
   */
  commands = new Collection(Command);
  /**
   * Collection of events registered with the client
   *
   * @memberof CommandClient
   */
  events = new Map<string, Collection<Event<Context>>>();
  /**
   * Whether or not to deploy commands globally (ignoring node env)
   *
   * @memberof CommandClient
   */
  deployGlobally: boolean;
  /**
   * Cooldown handler for the client can either be the default or a custom one
   *
   * @type {CooldownLogic}
   * @memberof CommandClient
   */
  cooldownHandler: CooldownLogic;
  private commandContext?: Context;
  private readonly commandMiddleware?: (interaction: Interaction) => Promise<FetchData> | FetchData;

  /**
   * Creates an instance of CommandClient.
   * @param {{ token: string; options?: ClientOptions; cooldownLogic?: CooldownLogic; commandContext?: Context }} { token, options, cooldownLogic, commandContext }
   * @memberof CommandClient
   */
  constructor({ token, options, cooldownLogic, commandContext, commandMiddleware, deployGlobally }: { token: string; options?: ClientOptions; cooldownLogic?: CooldownLogic; commandContext?: Context; commandMiddleware?: (interaction: Interaction) => Promise<FetchData> | FetchData; deployGlobally?: boolean }) {
    super(token, options);
    this.cooldownHandler = cooldownLogic ?? new CooldownHandler();
    this.commandContext = commandContext;
    this.deployGlobally = deployGlobally ?? false;
    this.commandMiddleware = commandMiddleware;

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.on('interactionCreate', this.handleInteraction.bind(this));
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.on('event', this.handleEvent.bind(this));
  }

  /**
   * Register a command with the client
   *
   * @param {Command} command
   * @param {boolean} [replace]
   * @memberof CommandClient
   */
  registerCommand(command: Command<Context>, replace?: boolean) {
    this.commands.add(command, undefined, replace);
  }

  /**
   * Register an event with the client
   *
   * @param {Event<Context>} event
   * @param {boolean} [replace]
   * @memberof CommandClient
   */
  registerEvent(event: Event<Context>, replace?: boolean) {
    let events = this.events.get(event.event);
    if (!events) {
      this.events.set(event.event, new Collection(Event));
      events = this.events.get(event.event);
    }
    events?.add(event, undefined, replace);
  }

  /**
   * Deploy commands
   *
   * @param {string[]} [commandNames] Array of command names that should be deployed. If not passed will deploy all
   * @return {*}
   * @memberof CommandClient
   */
  async deployCommands(commandNames?: string[]) {
    if (!this.commands.size) throw new Error('No commands registered in client');
    if (!this.isProduction && !this.deployGlobally && !this.devGuild) throw new Error('Unable to register commands, NODE_ENV not production and DEV_GUILD not set');

    const availableCommands = this.commands.filter((command) => (commandNames?.includes(command.command) ?? true) && command.definition !== undefined);
    let deployedCommands: APIApplicationCommand[] = [];

    if (this.isProduction || this.deployGlobally) {
      const publicCommands = availableCommands.filter((command) => !command.guilds?.length);
      if (publicCommands.length) deployedCommands = await this.bulkEditCommands(publicCommands.map((command) => (command.definition instanceof CommandBuilder ? command.definition.toJSON() : command.definition)) as RESTPostAPIApplicationCommandsJSONBody[]);
      const privateCommands = availableCommands.filter((command) => (command.guilds ? command.guilds.length > 0 : false));
      const guildCommands: Record<string, RESTPostAPIApplicationGuildCommandsJSONBody[]> = {};
      for (const command of privateCommands) {
        for (const guild of command.guilds!) {
          if (!guildCommands[guild]) guildCommands[guild] = [];
          guildCommands[guild].push((command.definition instanceof CommandBuilder ? command.definition.toJSON() : command.definition) as RESTPostAPIApplicationGuildCommandsJSONBody);
        }
      }
      for (const guild in guildCommands) {
        deployedCommands.push(...(await this.bulkEditGuildCommands(guild, guildCommands[guild])));
      }
    } else if (this.devGuild) {
      deployedCommands.push(...(await this.bulkEditGuildCommands(this.devGuild, availableCommands.map((command) => (command.definition instanceof CommandBuilder ? command.definition.toJSON() : command.definition)) as RESTPostAPIApplicationGuildCommandsJSONBody[])));
    }

    return deployedCommands;
  }

  private async handleInteraction(interaction: Interaction) {
    try {
      if (interaction.isCommand()) {
        const command = this.commands.find((c) => c.command === interaction.command);
        if (!command?.handleCommand) return;

        if (command.developerOnly && interaction.guild?.id !== this.devGuild) {
          this.emit('commandError', command.command, interaction, { type: CommandError.NotDeveloperGuild, data: interaction.guild?.id });
          return;
        }

        let userID: string | undefined = interaction.member?.id ?? interaction.user?.id;
        if (!userID && Object.keys(interaction.authorizing_integration_owners).includes('1')) {
          userID = interaction.authorizing_integration_owners['1'];
        }

        if (command.cooldown && userID) {
          const cooldown = await this.cooldownHandler.getCooldown(userID, command.command);
          if (cooldown.onCooldown) {
            this.emit('commandError', command.command, interaction, {
              type: CommandError.OnCooldown,
              data: {
                userID,
                cooldown
              }
            });
            return;
          }
        }

        if (userID && command.users && !command.users.includes(userID)) {
          this.emit('commandError', command.command, interaction, { type: CommandError.DeniedUser, data: userID });
          return;
        }

        if (interaction.inGuild() && userID) {
          if (command.guilds && !command.guilds.includes(interaction.guild.id)) {
            this.emit('commandError', command.command, interaction, { type: CommandError.DeniedGuild, data: interaction.guild.id });
            return;
          }

          if (command.userPermissions) {
            const missing: string[] = [];
            for (const permission of command.userPermissions) {
              if (!interaction.member.permissions.has(permission)) {
                missing.push(Object.keys(PermissionFlagsBits).find((key) => PermissionFlagsBits[key as keyof typeof PermissionFlagsBits] === permission)!);
              }
            }
            if (missing.length) {
              this.emit('commandError', command.command, interaction, { type: CommandError.MissingPermission, data: { userID, permissions: missing } });
              return;
            }
          }
        }

        let extraData: FetchData;
        try {
          extraData = this.commandMiddleware && command.fetchData.command ? await this.commandMiddleware(interaction) : (undefined as FetchData);
        } catch (error) {
          return this.emit('commandError', command.command, interaction, { type: CommandError.MiddlewareError, data: error });
        }

        try {
          await command.handleCommand(this.commandContext ?? this, interaction, extraData);
          this.emit('commandExecuted', command.command, 'command', interaction);
        } catch (error) {
          this.emit('commandError', command.command, interaction, { type: CommandError.UncaughtError, data: error as Error, interaction: 'command' });
        }
        if (command.cooldown && userID) await this.cooldownHandler.setCooldown(userID, command.command, command.cooldown * 1000 + Date.now());
      } else if (interaction.isAutocomplete()) {
        const command = this.commands.find((c) => c.command === interaction.data.name);
        if (!command?.handleAutocomplete) return;

        let extraData: FetchData;
        try {
          extraData = this.commandMiddleware && command.fetchData.autocomplete ? await this.commandMiddleware(interaction) : (undefined as FetchData);
        } catch (error) {
          return this.emit('commandError', command.command, interaction, { type: CommandError.MiddlewareError, data: error });
        }

        try {
          await command.handleAutocomplete(this.commandContext ?? this, interaction, extraData);
          this.emit('commandExecuted', command.command, 'autocomplete', interaction);
        } catch (error) {
          this.emit('commandError', command.command, interaction, { type: CommandError.UncaughtError, data: error as Error, interaction: 'autocomplete' });
        }
      } else if (interaction.isModal()) {
        const command = this.commands.find((c) => interaction.data.custom_id.startsWith(`${c.command}:`));
        if (!command?.handleModal) return;

        let extraData: FetchData;
        try {
          extraData = this.commandMiddleware && command.fetchData.modal ? await this.commandMiddleware(interaction) : (undefined as FetchData);
        } catch (error) {
          return this.emit('commandError', command.command, interaction, { type: CommandError.MiddlewareError, data: error });
        }

        try {
          await command.handleModal(this.commandContext ?? this, interaction, extraData);
          this.emit('commandExecuted', command.command, 'modal', interaction);
        } catch (error) {
          this.emit('commandError', command.command, interaction, { type: CommandError.UncaughtError, data: error as Error, interaction: 'modal' });
        }
      } else if (interaction.isComponent()) {
        const command = this.commands.find((c) => interaction.data.custom_id.startsWith(`${c.command}:`));
        if (!command?.handleComponent) return;

        let extraData: FetchData;
        try {
          extraData = this.commandMiddleware && command.fetchData.component ? await this.commandMiddleware(interaction) : (undefined as FetchData);
        } catch (error) {
          return this.emit('commandError', command.command, interaction, { type: CommandError.MiddlewareError, data: error });
        }

        try {
          await command.handleComponent(this.commandContext ?? this, interaction, extraData);
          this.emit('commandExecuted', command.command, 'component', interaction);
        } catch (error) {
          this.emit('commandError', command.command, interaction, { type: CommandError.UncaughtError, data: error as Error, interaction: 'component' });
        }
      }
    } catch (error) {
      this.emit('error', error as Error);
    }
  }

  private async handleEvent(eventName: keyof Events, ...args: any[]) {
    const events = this.events.get(eventName);
    if (!events) return;
    for (const [, event] of events) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await event.handle(this.commandContext ?? (this as unknown as Context), ...args);
      } catch (error) {
        this.emit('error', error as Error);
      }
    }
  }

  /**
   * Set the context for the client to pass to bot code on interaction or events
   *
   * @param {Context} context
   * @memberof CommandClient
   */
  setContext(context: Context) {
    this.commandContext = context;
  }

  /**
   * returns true if NODE_ENV is 'production'
   *
   * @readonly
   * @memberof CommandClient
   */
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * returns the dev guild id if DEV_GUILD is set
   *
   * @readonly
   * @memberof CommandClient
   */
  get devGuild() {
    return process.env.DEV_GUILD ?? null;
  }
}
