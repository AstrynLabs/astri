import { InteractionCallbackTypes, type ApplicationCommandTypes, type InteractionTypes } from '../../../constants';
import type { APIApplicationCommandInteractionData, APIInteraction, APIMessage, AutocompleteChoice, ClientContext, InteractionModalData } from '../../../types';
import type { Member } from '../member';
import type { User } from '../user';
import { Interaction, RepliableInteraction } from './interaction';
import { CommandOptions } from './options';
import { InteractionResolved } from './resolved';

/**
 * Common ground for every application command. Use {@link createInteraction} to get the subclass matching the
 * command's type; command types the library has no class for are built as this class.
 */
export class CommandInteraction extends RepliableInteraction {
    declare readonly type: typeof InteractionTypes.ApplicationCommand;
    readonly commandId: string;
    readonly commandName: string;
    readonly commandType: ApplicationCommandTypes;
    /** Set when the command is registered to a guild rather than globally. */
    readonly commandGuildId: string | null;
    readonly resolved: InteractionResolved;

    constructor(client: ClientContext, data: APIInteraction) {
        super(client, data);
        const command = data.data as APIApplicationCommandInteractionData;
        this.commandId = command.id;
        this.commandName = command.name;
        this.commandType = command.type;
        this.commandGuildId = command.guild_id ?? null;
        this.resolved = new InteractionResolved(client, command.resolved, this.guildId);
    }

    /** Responds by opening a modal. Its submission arrives as a {@link ModalSubmitInteraction}. */
    showModal(data: InteractionModalData): Promise<void> {
        return this.sendCallback({ type: InteractionCallbackTypes.Modal, data });
    }
}

/** A slash command was used. */
export class ChatInputCommandInteraction extends CommandInteraction {
    declare readonly commandType: typeof ApplicationCommandTypes.ChatInput;
    readonly options: CommandOptions;

    constructor(client: ClientContext, data: APIInteraction) {
        super(client, data);
        this.options = new CommandOptions((data.data as APIApplicationCommandInteractionData).options, this.resolved);
    }
}

/** A user command was used from a user's context menu. */
export class UserCommandInteraction extends CommandInteraction {
    declare readonly commandType: typeof ApplicationCommandTypes.User;
    readonly targetId: string;
    readonly targetUser: User;
    /** `null` outside guilds, or when the target is not in the guild. */
    readonly targetMember: Member | null;

    constructor(client: ClientContext, data: APIInteraction) {
        super(client, data);
        this.targetId = (data.data as APIApplicationCommandInteractionData).target_id!;
        this.targetUser = this.resolved.users.get(this.targetId)!;
        this.targetMember = this.resolved.members.get(this.targetId) ?? null;
    }
}

/** A message command was used from a message's context menu. */
export class MessageCommandInteraction extends CommandInteraction {
    declare readonly commandType: typeof ApplicationCommandTypes.Message;
    readonly targetId: string;
    readonly targetMessage: APIMessage;

    constructor(client: ClientContext, data: APIInteraction) {
        super(client, data);
        this.targetId = (data.data as APIApplicationCommandInteractionData).target_id!;
        this.targetMessage = this.resolved.messages.get(this.targetId)!;
    }
}

/** An Activity's entry point command was used, and the app handles launching it instead of Discord. */
export class EntryPointCommandInteraction extends CommandInteraction {
    declare readonly commandType: typeof ApplicationCommandTypes.PrimaryEntryPoint;

    /** Responds by launching the app's Activity. */
    launchActivity(): Promise<void> {
        return this.sendCallback({ type: InteractionCallbackTypes.LaunchActivity });
    }
}

/** A user is typing in a command option with autocomplete. Answer with {@link AutocompleteInteraction.respond}. */
export class AutocompleteInteraction extends Interaction {
    declare readonly type: typeof InteractionTypes.ApplicationCommandAutocomplete;
    readonly commandId: string;
    readonly commandName: string;
    readonly commandType: ApplicationCommandTypes;
    /** Set when the command is registered to a guild rather than globally. */
    readonly commandGuildId: string | null;
    /** What has been typed so far. Every value is a string, whatever the option's type; `focused` is the one being typed in. */
    readonly options: CommandOptions;

    constructor(client: ClientContext, data: APIInteraction) {
        super(client, data);
        const command = data.data as APIApplicationCommandInteractionData;
        this.commandId = command.id;
        this.commandName = command.name;
        this.commandType = command.type;
        this.commandGuildId = command.guild_id ?? null;
        this.options = new CommandOptions(command.options, new InteractionResolved(client, command.resolved, this.guildId));
    }

    /** Shows up to 25 suggestions. An empty list shows none. */
    respond(choices: AutocompleteChoice<string>[] | AutocompleteChoice<number>[]): Promise<void> {
        return this.sendCallback({ type: InteractionCallbackTypes.ApplicationCommandAutocompleteResult, data: { choices: choices as AutocompleteChoice<string>[] } });
    }
}
