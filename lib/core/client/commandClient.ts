import { CommandErrorTypes } from '../../constants';
import type { AnyInteraction, ApplicationCommand } from '../structures';
import { AutocompleteInteraction, CommandInteraction, ComponentInteraction, ModalSubmitInteraction } from '../structures';
import type { ClientEvents, CommandBuilderData, CommandClientOptions, CommandErrorData, CommandHandlerInteraction, CooldownLogic } from '../../types';
import { Collection } from '../cache';
import { CooldownHandler } from '../commands';
import type { Command, EventHandler } from '../commands';
import { customIdCommand, definitionData } from '../commands/util';
import { Client } from './client';

/**
 * An opinionated {@link Client} that routes interactions to registered {@link Command}s and client events to
 * registered {@link EventHandler}s, passing each the same context.
 *
 * Before a command runs, its developer guild, user, guild, permission and cooldown limits are checked. A refusal
 * or a failure is emitted as `commandError`, and a handler that finished as `commandExecuted`.
 *
 * Outside production, commands deploy only to the developer guild.
 */
export class CommandClient<Context = CommandClient<any, any>, Data = undefined> extends Client {
    /** Registered commands, keyed by name. */
    readonly commands = new Collection<string, Command<Context, Data, any>>();
    readonly cooldownLogic: CooldownLogic;
    readonly deployGlobally: boolean;
    readonly devGuildId: string | null;

    readonly #events = new Map<EventHandler<Context>, (...args: unknown[]) => void>();
    readonly #middleware: ((interaction: CommandHandlerInteraction) => Data | PromiseLike<Data>) | undefined;
    #context: Context;

    constructor(options: CommandClientOptions<Context, Data>) {
        super(options);
        this.cooldownLogic = options.cooldownLogic ?? new CooldownHandler();
        this.deployGlobally = options.deployGlobally ?? process.env.NODE_ENV === 'production';
        this.devGuildId = options.devGuildId !== undefined ? options.devGuildId : (process.env.DEV_GUILD ?? null);
        this.#middleware = options.commandMiddleware;
        this.#context = options.commandContext ?? (this as unknown as Context);
        this.on('interactionCreate', (interaction) => void this.#handleInteraction(interaction));
    }

    /** Every registered event handler. */
    get events(): EventHandler<Context>[] {
        return [...this.#events.keys()];
    }

    /** Replaces the context passed to handlers from now on. */
    setContext(context: Context): void {
        this.#context = context;
    }

    /** @throws When a command with the same name is registered and `replace` is not set. */
    registerCommand(command: Command<Context, Data, any>, replace = false): this {
        if (!replace && this.commands.has(command.name)) throw new Error(`A command named ${command.name} is already registered`);
        this.commands.set(command.name, command);
        return this;
    }

    removeCommand(name: string): boolean {
        return this.commands.delete(name);
    }

    /** @throws When the handler is already registered. */
    registerEvent(handler: EventHandler<Context, any>): this {
        if (this.#events.has(handler)) throw new Error(`This ${handler.event} handler is already registered`);
        const listener = (...args: unknown[]): void => {
            if (handler.once) this.#events.delete(handler);
            void this.#runEvent(handler, args);
        };
        this.#events.set(handler, listener);
        if (handler.once) this.once(handler.event, listener);
        else this.on(handler.event, listener);
        return this;
    }

    removeEvent(handler: EventHandler<Context, any>): boolean {
        const listener = this.#events.get(handler);
        if (listener === undefined) return false;
        this.off(handler.event, listener);
        return this.#events.delete(handler);
    }

    /**
     * Deploys the registered commands that have a definition. In production, or with `deployGlobally`, commands
     * with `guilds` go to those guilds and the rest globally; otherwise all of them go to the developer guild.
     *
     * Without `names`, each target's command list is replaced, deleting commands not registered here. With `names`,
     * only those commands are created or overwritten, and the others are left alone.
     *
     * @throws When nothing is left to deploy, or when not deploying globally and no developer guild is set.
     */
    async deployCommands(names?: string[]): Promise<ApplicationCommand[]> {
        const targets = new Map<string | undefined, CommandBuilderData[]>();
        for (const command of this.commands.values()) {
            const data = definitionData(command.definition);
            if (data === null || (names !== undefined && !names.includes(command.name))) continue;
            if (!this.deployGlobally) {
                if (this.devGuildId === null) throw new Error('Set devGuildId or DEV_GUILD to deploy commands outside production, or turn on deployGlobally');
                this.#addTarget(targets, this.devGuildId, data);
            } else if (command.guilds === null) this.#addTarget(targets, undefined, data);
            else for (const guildId of command.guilds) this.#addTarget(targets, guildId, data);
        }
        if (targets.size === 0) throw new Error('No registered commands to deploy');
        const deployed: ApplicationCommand[] = [];
        for (const [guildId, commands] of targets) {
            if (names === undefined) deployed.push(...(await this.setCommands(commands, guildId)));
            else for (const data of commands) deployed.push(await this.createCommand(data, guildId));
        }
        return deployed;
    }

    #addTarget(targets: Map<string | undefined, CommandBuilderData[]>, guildId: string | undefined, data: CommandBuilderData): void {
        const commands = targets.get(guildId);
        if (commands === undefined) targets.set(guildId, [data]);
        else commands.push(data);
    }

    async #handleInteraction(interaction: AnyInteraction): Promise<void> {
        if (interaction instanceof CommandInteraction) {
            const command = this.commands.get(interaction.commandName);
            if (command?.handleCommand === undefined) return;
            let refusal: CommandErrorData | null;
            try {
                refusal = await this.#check(command, interaction);
            } catch (error) {
                this.emit('commandError', command, interaction, { type: CommandErrorTypes.UncaughtError, error });
                return;
            }
            if (refusal !== null) this.emit('commandError', command, interaction, refusal);
            else await this.#run(command, interaction, command.fetchData.command, command.handleCommand);
        } else if (interaction instanceof AutocompleteInteraction) {
            const command = this.commands.get(interaction.commandName);
            if (command?.handleAutocomplete !== undefined) await this.#run(command, interaction, command.fetchData.autocomplete, command.handleAutocomplete);
        } else if (interaction instanceof ComponentInteraction) {
            const command = this.commands.get(customIdCommand(interaction.customId));
            if (command?.handleComponent !== undefined) await this.#run(command, interaction, command.fetchData.component, command.handleComponent);
        } else if (interaction instanceof ModalSubmitInteraction) {
            const command = this.commands.get(customIdCommand(interaction.customId));
            if (command?.handleModal !== undefined) await this.#run(command, interaction, command.fetchData.modal, command.handleModal);
        }
    }

    async #check(command: Command<Context, Data, any>, interaction: CommandInteraction): Promise<CommandErrorData | null> {
        const userId = interaction.user.id;
        if (command.developerOnly && (this.devGuildId === null || interaction.guildId !== this.devGuildId)) return { type: CommandErrorTypes.NotDeveloperGuild, guildId: interaction.guildId };
        if (command.users !== null && !command.users.includes(userId)) return { type: CommandErrorTypes.DeniedUser, userId };
        if (command.guilds !== null && interaction.guildId !== null && !command.guilds.includes(interaction.guildId)) return { type: CommandErrorTypes.DeniedGuild, guildId: interaction.guildId };
        if (command.userPermissions !== null && interaction.memberPermissions !== null) {
            const missing = interaction.memberPermissions.missing(command.userPermissions);
            if (missing.length > 0) return { type: CommandErrorTypes.MissingPermission, userId, permissions: missing };
        }
        if (command.cooldown > 0) {
            const cooldown = await this.cooldownLogic.getCooldown(userId, command.name);
            if (cooldown.onCooldown) return { type: CommandErrorTypes.OnCooldown, userId, cooldown };
            await this.cooldownLogic.setCooldown(userId, command.name, Date.now() + command.cooldown * 1000);
        }
        return null;
    }

    async #run<I extends CommandHandlerInteraction>(command: Command<Context, Data, any>, interaction: I, fetch: boolean, handler: (context: Context, interaction: I, data: Data) => unknown): Promise<void> {
        let data: Data;
        try {
            data = fetch && this.#middleware !== undefined ? await this.#middleware(interaction) : (undefined as Data);
        } catch (error) {
            this.emit('commandError', command, interaction, { type: CommandErrorTypes.MiddlewareError, error });
            return;
        }
        try {
            await handler.call(command, this.#context, interaction, data);
        } catch (error) {
            this.emit('commandError', command, interaction, { type: CommandErrorTypes.UncaughtError, error });
            return;
        }
        this.emit('commandExecuted', command, interaction);
    }

    async #runEvent(handler: EventHandler<Context>, args: unknown[]): Promise<void> {
        try {
            await handler.handle(this.#context, ...(args as ClientEvents[keyof ClientEvents]));
        } catch (error) {
            this.emit('eventError', handler, error);
        }
    }
}
