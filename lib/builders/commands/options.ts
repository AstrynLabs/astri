import { ApplicationCommandOptionTypes, BuilderLimits } from '../../constants';
import type { APIValueOptionRequest, CommandOptionChannelTypes, IntegerOptionData, NumberOptionData, StringOptionData } from '../../types';
import { toStringChoice } from '../util';

/** The name, description and their translations shared by commands, subcommands and groups. */
export abstract class LocalizedCommandBuilder {
    readonly name: string;
    readonly description: string;
    #nameLocalizations: Record<string, string> | undefined;
    #descriptionLocalizations: Record<string, string> | undefined;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }

    /** Translations of the name, keyed by locale such as `en-US`. */
    setNameLocalizations(localizations: Record<string, string>): this {
        this.#nameLocalizations = localizations;
        return this;
    }

    /** Translations of the description, keyed by locale such as `en-US`. */
    setDescriptionLocalizations(localizations: Record<string, string>): this {
        this.#descriptionLocalizations = localizations;
        return this;
    }

    protected get localizations(): { name_localizations: Record<string, string> | undefined; description_localizations: Record<string, string> | undefined } {
        return { name_localizations: this.#nameLocalizations, description_localizations: this.#descriptionLocalizations };
    }
}

/** The value options shared by commands and subcommands. At most 25 options can be added. */
export abstract class CommandOptionsBuilder<Extra = never> extends LocalizedCommandBuilder {
    readonly #options: Array<APIValueOptionRequest | Extra> = [];

    /** Giving `choices` turns `autocomplete` off. */
    addStringOption({ choices, autocomplete, ...data }: StringOptionData): this {
        this.#checkChoices(choices);
        return this.addOption({ type: ApplicationCommandOptionTypes.String, ...data, autocomplete: choices?.length ? false : autocomplete, choices: choices?.map(toStringChoice) });
    }

    /** Giving `choices` turns `autocomplete` off. */
    addIntegerOption({ choices, autocomplete, ...data }: IntegerOptionData): this {
        this.#checkChoices(choices);
        return this.addOption({ type: ApplicationCommandOptionTypes.Integer, ...data, autocomplete: choices?.length ? false : autocomplete, choices });
    }

    /** Giving `choices` turns `autocomplete` off. */
    addNumberOption({ choices, autocomplete, ...data }: NumberOptionData): this {
        this.#checkChoices(choices);
        return this.addOption({ type: ApplicationCommandOptionTypes.Number, ...data, autocomplete: choices?.length ? false : autocomplete, choices });
    }

    addBooleanOption(name: string, description: string, required = false): this {
        return this.addOption({ type: ApplicationCommandOptionTypes.Boolean, name, description, required });
    }

    addUserOption(name: string, description: string, required = false): this {
        return this.addOption({ type: ApplicationCommandOptionTypes.User, name, description, required });
    }

    /** An empty `types` accepts every channel type. */
    addChannelOption(name: string, description: string, required = false, types: CommandOptionChannelTypes = []): this {
        return this.addOption({ type: ApplicationCommandOptionTypes.Channel, name, description, required, channel_types: types });
    }

    addRoleOption(name: string, description: string, required = false): this {
        return this.addOption({ type: ApplicationCommandOptionTypes.Role, name, description, required });
    }

    /** A user or a role. */
    addMentionableOption(name: string, description: string, required = false): this {
        return this.addOption({ type: ApplicationCommandOptionTypes.Mentionable, name, description, required });
    }

    addAttachmentOption(name: string, description: string, required = false): this {
        return this.addOption({ type: ApplicationCommandOptionTypes.Attachment, name, description, required });
    }

    protected get options(): Array<APIValueOptionRequest | Extra> {
        return [...this.#options];
    }

    protected addOption(option: APIValueOptionRequest | Extra): this {
        if (this.#options.length >= BuilderLimits.CommandOptions) throw new TypeError(`A command can't have more than ${BuilderLimits.CommandOptions} options`);
        this.#options.push(option);
        return this;
    }

    #checkChoices(choices: unknown[] | null | undefined): void {
        if (choices && choices.length > BuilderLimits.CommandChoices) throw new TypeError(`An option can't have more than ${BuilderLimits.CommandChoices} choices`);
    }
}
