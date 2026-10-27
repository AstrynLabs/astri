import { ApplicationCommandOptionTypes, BuilderLimits } from '../../constants';
import type { APISubcommandGroupOptionRequest, APISubcommandOptionRequest } from '../../types';
import { CommandOptionsBuilder, LocalizedCommandBuilder } from './options';

/** Builds a subcommand, used as `/command subcommand`. */
export class SubcommandBuilder extends CommandOptionsBuilder {
    toJSON(): APISubcommandOptionRequest {
        return { type: ApplicationCommandOptionTypes.Subcommand, name: this.name, description: this.description, ...this.localizations, options: this.options };
    }
}

/** Builds a group of subcommands, used as `/command group subcommand`. */
export class SubcommandGroupBuilder extends LocalizedCommandBuilder {
    readonly #subcommands: SubcommandBuilder[] = [];

    addSubcommand(name: string, description: string, callback?: (builder: SubcommandBuilder) => void): this {
        if (this.#subcommands.length >= BuilderLimits.CommandOptions) throw new TypeError(`A subcommand group can't have more than ${BuilderLimits.CommandOptions} subcommands`);
        const builder = new SubcommandBuilder(name, description);
        callback?.(builder);
        this.#subcommands.push(builder);
        return this;
    }

    toJSON(): APISubcommandGroupOptionRequest {
        return { type: ApplicationCommandOptionTypes.SubcommandGroup, name: this.name, description: this.description, ...this.localizations, options: this.#subcommands.map((subcommand) => subcommand.toJSON()) };
    }
}
