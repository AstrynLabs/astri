import type { CommandBuilder } from '../builders';
import type { CommandErrorTypes } from '../constants';
import type { AutocompleteInteraction, CommandInteraction, ComponentInteraction, ModalSubmitInteraction } from '../core/structures';
import type { CooldownState } from '../interfaces';
import type { CommandBuilderData } from './builders';
import type { ClientOptions } from './client';
import type { PermissionName } from './permission';

/**
 * What a command deploys as: a builder or its JSON. A plain name deploys nothing, for a command that only answers
 * components and modals.
 */
export type CommandDefinition = CommandBuilder | CommandBuilderData | string;

/** Every interaction a `CommandClient` routes to a command. */
export type CommandHandlerInteraction = CommandInteraction | AutocompleteInteraction | ComponentInteraction | ModalSubmitInteraction;

/** Which of a command's handlers get the result of `commandMiddleware`. */
export interface CommandFetchData {
    command: boolean;
    autocomplete: boolean;
    component: boolean;
    modal: boolean;
}

/** Where cooldowns are kept. Implement it to keep them somewhere shared, like Redis. */
export interface CooldownLogic {
    getCooldown(userId: string, command: string): CooldownState | PromiseLike<CooldownState>;
    /** `expiry` is in Unix ms. */
    setCooldown(userId: string, command: string, expiry: number): unknown;
}

export interface CommandClientOptions<Context, Data> extends ClientOptions {
    /** Passed to every command and event handler. Default: the client. */
    commandContext?: Context;
    /** Runs before each handler its command enables in `fetchData`, and what it returns is passed to the handler. */
    commandMiddleware?: (interaction: CommandHandlerInteraction) => Data | PromiseLike<Data>;
    /** Default: an in-memory `CooldownHandler`. */
    cooldownLogic?: CooldownLogic;
    /** Deploy to every guild and globally instead of only the developer guild. Default: `NODE_ENV === 'production'`. */
    deployGlobally?: boolean;
    /** Where commands deploy outside production, and the only guild developer-only commands run in. Default: the `DEV_GUILD` env variable. */
    devGuildId?: string | null;
}

/** Why a command handler did not run or failed, narrowed by `type`. */
export type CommandErrorData = { type: typeof CommandErrorTypes.NotDeveloperGuild; guildId: string | null } | { type: typeof CommandErrorTypes.DeniedUser; userId: string } | { type: typeof CommandErrorTypes.DeniedGuild; guildId: string } | { type: typeof CommandErrorTypes.MissingPermission; userId: string; permissions: PermissionName[] } | { type: typeof CommandErrorTypes.OnCooldown; userId: string; cooldown: CooldownState } | { type: typeof CommandErrorTypes.MiddlewareError; error: unknown } | { type: typeof CommandErrorTypes.UncaughtError; error: unknown };
