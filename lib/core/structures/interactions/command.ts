import { InteractionCallbackTypes, type ApplicationCommandTypes, type InteractionTypes } from '../../../constants';
import type { APIApplicationCommandInteractionData, APIInteraction, AutocompleteChoice, ClientContext, InteractionModalData } from '../../../types';
import type { Attachment } from '../attachment';
import type { Channel } from '../channels';
import type { Member } from '../member';
import type { Message } from '../message';
import type { Role } from '../role';
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

    /** The invoked subcommand group, or `null` when the subcommand is not in one. */
    get subcommandGroup(): string | null {
        return this.options.subcommandGroup;
    }

    /** The invoked subcommand, or `null` when the command has none. */
    get subcommand(): string | null {
        return this.options.subcommand;
    }

    /** `null` when the option was left out. */
    getString(name: string): string | null {
        return this.options.getString(name);
    }

    /** @throws When the option was left out. */
    getRequiredString(name: string): string {
        return this.options.getString(name, true);
    }

    /** `null` when the option was left out. */
    getInteger(name: string): number | null {
        return this.options.getInteger(name);
    }

    /** @throws When the option was left out. */
    getRequiredInteger(name: string): number {
        return this.options.getInteger(name, true);
    }

    /** `null` when the option was left out. */
    getNumber(name: string): number | null {
        return this.options.getNumber(name);
    }

    /** @throws When the option was left out. */
    getRequiredNumber(name: string): number {
        return this.options.getNumber(name, true);
    }

    /** `null` when the option was left out. */
    getBoolean(name: string): boolean | null {
        return this.options.getBoolean(name);
    }

    /** @throws When the option was left out. */
    getRequiredBoolean(name: string): boolean {
        return this.options.getBoolean(name, true);
    }

    /** `null` when the option was left out. */
    getAttachment(name: string): Attachment | null {
        return this.options.getAttachment(name);
    }

    /** @throws When the option was left out. */
    getRequiredAttachment(name: string): Attachment {
        return this.options.getAttachment(name, true);
    }

    /** `null` when the option was left out. */
    getChannel(name: string): Channel | null {
        return this.options.getChannel(name);
    }

    /** @throws When the option was left out. */
    getRequiredChannel(name: string): Channel {
        return this.options.getChannel(name, true);
    }

    /** `null` when the option was left out. */
    getRole(name: string): Role | null {
        return this.options.getRole(name);
    }

    /** @throws When the option was left out. */
    getRequiredRole(name: string): Role {
        return this.options.getRole(name, true);
    }

    /** `null` when the option was left out. */
    getUser(name: string): User | null {
        return this.options.getUser(name);
    }

    /** @throws When the option was left out. */
    getRequiredUser(name: string): User {
        return this.options.getUser(name, true);
    }

    /** `null` when the option was left out, or the user is not in the guild. */
    getMember(name: string): Member | null {
        return this.options.getMember(name);
    }

    /** @throws When the option was left out, or the user is not in the guild. */
    getRequiredMember(name: string): Member {
        const member = this.options.getMember(name);
        if (member === null) throw new TypeError(`Option "${name}" has no member`);
        return member;
    }

    /** `null` when the option was left out. */
    getMentionable(name: string): User | Role | null {
        return this.options.getMentionable(name);
    }

    /** @throws When the option was left out. */
    getRequiredMentionable(name: string): User | Role {
        return this.options.getMentionable(name, true);
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
    readonly targetMessage: Message;

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

    /** The subcommand group being typed in, or `null` when the subcommand is not in one. */
    get subcommandGroup(): string | null {
        return this.options.subcommandGroup;
    }

    /** The subcommand being typed in, or `null` when the command has none. */
    get subcommand(): string | null {
        return this.options.subcommand;
    }

    /** Shows up to 25 suggestions. An empty list shows none. */
    respond(choices: AutocompleteChoice<string>[] | AutocompleteChoice<number>[]): Promise<void> {
        return this.sendCallback({ type: InteractionCallbackTypes.ApplicationCommandAutocompleteResult, data: { choices: choices as AutocompleteChoice<string>[] } });
    }
}
