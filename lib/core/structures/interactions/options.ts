import { ApplicationCommandOptionTypes } from '../../../constants';
import type { Attachment } from '../../../interfaces';
import type { APIApplicationCommandInteractionDataOption } from '../../../types';
import type { Channel } from '../channels';
import type { Member } from '../member';
import type { Role } from '../role';
import type { User } from '../user';
import type { InteractionResolved } from './resolved';

type OptionResult<Required extends boolean, T> = Required extends true ? T : T | null;

/**
 * The options a user filled in for a chat input command, with the subcommand and group already stepped into.
 *
 * Each getter returns `null` when the option was left out, or throws when `required` is `true`. Getters also
 * throw when the option exists but is of another type.
 */
export class CommandOptions {
    readonly subcommandGroup: string | null = null;
    readonly subcommand: string | null = null;
    /** The options of the invoked subcommand, or of the command itself when it has none. */
    readonly data: APIApplicationCommandInteractionDataOption[];
    readonly #resolved: InteractionResolved;

    constructor(options: APIApplicationCommandInteractionDataOption[] = [], resolved: InteractionResolved) {
        let leaf = options;
        if (leaf[0]?.type === ApplicationCommandOptionTypes.SubcommandGroup) {
            this.subcommandGroup = leaf[0].name;
            leaf = leaf[0].options ?? [];
        }
        if (leaf[0]?.type === ApplicationCommandOptionTypes.Subcommand) {
            this.subcommand = leaf[0].name;
            leaf = leaf[0].options ?? [];
        }
        this.data = leaf;
        this.#resolved = resolved;
    }

    /** The option being autocompleted. */
    get focused(): APIApplicationCommandInteractionDataOption | undefined {
        return this.data.find((option) => option.focused === true);
    }

    get(name: string): APIApplicationCommandInteractionDataOption | undefined {
        return this.data.find((option) => option.name === name);
    }

    getString<R extends boolean = false>(name: string, required?: R): OptionResult<R, string> {
        return this.#value(name, [ApplicationCommandOptionTypes.String], required) as OptionResult<R, string>;
    }

    getInteger<R extends boolean = false>(name: string, required?: R): OptionResult<R, number> {
        return this.#value(name, [ApplicationCommandOptionTypes.Integer], required) as OptionResult<R, number>;
    }

    getNumber<R extends boolean = false>(name: string, required?: R): OptionResult<R, number> {
        return this.#value(name, [ApplicationCommandOptionTypes.Number], required) as OptionResult<R, number>;
    }

    getBoolean<R extends boolean = false>(name: string, required?: R): OptionResult<R, boolean> {
        return this.#value(name, [ApplicationCommandOptionTypes.Boolean], required) as OptionResult<R, boolean>;
    }

    getUser<R extends boolean = false>(name: string, required?: R): OptionResult<R, User> {
        return this.#resolve(name, [ApplicationCommandOptionTypes.User, ApplicationCommandOptionTypes.Mentionable], this.#resolved.users, required);
    }

    /** The member for a user option. `null` when the user is not in the guild, so it is never required. */
    getMember(name: string): Member | null {
        return this.#resolve(name, [ApplicationCommandOptionTypes.User, ApplicationCommandOptionTypes.Mentionable], this.#resolved.members, false);
    }

    getRole<R extends boolean = false>(name: string, required?: R): OptionResult<R, Role> {
        return this.#resolve(name, [ApplicationCommandOptionTypes.Role, ApplicationCommandOptionTypes.Mentionable], this.#resolved.roles, required);
    }

    /** Uncached channels are built from the partial channel in the payload. */
    getChannel<R extends boolean = false>(name: string, required?: R): OptionResult<R, Channel> {
        return this.#resolve(name, [ApplicationCommandOptionTypes.Channel], this.#resolved.channels, required);
    }

    getMentionable<R extends boolean = false>(name: string, required?: R): OptionResult<R, User | Role> {
        const id = this.#value(name, [ApplicationCommandOptionTypes.Mentionable, ApplicationCommandOptionTypes.User, ApplicationCommandOptionTypes.Role], required) as string | null;
        if (id === null) return null as OptionResult<R, User | Role>;
        return (this.#resolved.users.get(id) ?? this.#resolved.roles.get(id) ?? null) as OptionResult<R, User | Role>;
    }

    getAttachment<R extends boolean = false>(name: string, required?: R): OptionResult<R, Attachment> {
        return this.#resolve(name, [ApplicationCommandOptionTypes.Attachment], this.#resolved.attachments, required);
    }

    #value(name: string, types: ApplicationCommandOptionTypes[], required: boolean | undefined): string | number | boolean | null {
        const option = this.get(name);
        if (option === undefined || option.value === undefined) {
            if (required === true) throw new TypeError(`Option "${name}" was not provided`);
            return null;
        }
        if (!types.includes(option.type)) throw new TypeError(`Option "${name}" is of type ${option.type}, expected ${types.join(' or ')}`);
        return option.value;
    }

    #resolve<R extends boolean, T>(name: string, types: ApplicationCommandOptionTypes[], from: Map<string, T>, required: R | undefined): OptionResult<R, T> {
        const id = this.#value(name, types, required);
        if (id === null) return null as OptionResult<R, T>;
        const value = from.get(String(id));
        if (value === undefined && required === true) throw new TypeError(`Option "${name}" was not resolved`);
        return (value ?? null) as OptionResult<R, T>;
    }
}
