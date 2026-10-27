import { CUSTOM_ID_SEPARATOR } from '../../constants';
import type { CommandDefinition, CommandFetchData, PermissionResolvable } from '../../types';
import type { CommandClient } from '../client';
import type { AutocompleteInteraction, ChatInputCommandInteraction, CommandInteraction, ComponentInteraction, ModalSubmitInteraction } from '../structures';
import { definitionName } from './util';

/**
 * A command for a {@link CommandClient}. Implement the handlers it should answer; the rest are ignored.
 *
 * Components and modals are routed to the command named before the first `:` of their `custom_id`, so build those
 * ids with {@link Command.customId}. `Interaction` is the class `handleCommand` receives, which follows the
 * definition's command type.
 */
export abstract class Command<Context = CommandClient, Data = undefined, Interaction extends CommandInteraction = ChatInputCommandInteraction> {
    abstract readonly definition: CommandDefinition;
    /** Deploy only to these guilds, and refuse to run anywhere else. Default: `null`, deployed globally. */
    guilds: string[] | null = null;
    /** Run only in the developer guild. */
    developerOnly = false;
    /** Permissions a member needs in the channel to run the command. Not checked outside guilds. */
    userPermissions: PermissionResolvable | null = null;
    /** Only these users can run the command. */
    users: string[] | null = null;
    /** Seconds a user waits between uses. `0` turns it off. */
    cooldown = 0;
    /** Which handlers get the result of the client's `commandMiddleware`. */
    fetchData: CommandFetchData = { command: true, autocomplete: false, component: true, modal: true };

    handleCommand?(context: Context, interaction: Interaction, data: Data): unknown;
    handleAutocomplete?(context: Context, interaction: AutocompleteInteraction, data: Data): unknown;
    handleComponent?(context: Context, interaction: ComponentInteraction, data: Data): unknown;
    handleModal?(context: Context, interaction: ModalSubmitInteraction, data: Data): unknown;

    /** The definition's name. Commands are registered and routed by it. */
    get name(): string {
        return definitionName(this.definition);
    }

    /** A `custom_id` routed back to this command: its name and `parts`, joined by `:`. */
    customId(...parts: Array<string | number>): string {
        return [this.name, ...parts].join(CUSTOM_ID_SEPARATOR);
    }
}
