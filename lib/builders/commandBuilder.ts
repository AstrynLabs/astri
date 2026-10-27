import { ApplicationCommandTypes, ApplicationIntegrationTypes, InteractionContextTypes } from '../constants';
import { Permission } from '../core/structures';
import type { APISubcommandGroupOptionRequest, APISubcommandOptionRequest, APIValueOptionRequest, CommandBuilderData, PermissionResolvable } from '../types';
import { CommandOptionsBuilder, SubcommandBuilder, SubcommandGroupBuilder } from './commands';
import { isSubcommand } from './util';

/**
 * Builds a command to pass to `createCommand` or a bulk overwrite. A command has either subcommands and groups, or
 * value options, never both.
 *
 * Unless set, the command is a slash command, installable to guilds, and usable everywhere.
 */
export class CommandBuilder extends CommandOptionsBuilder<APISubcommandOptionRequest | APISubcommandGroupOptionRequest> {
    #type: ApplicationCommandTypes = ApplicationCommandTypes.ChatInput;
    #integrationTypes: ApplicationIntegrationTypes[] = [ApplicationIntegrationTypes.GuildInstall];
    #contexts: InteractionContextTypes[] = [InteractionContextTypes.Guild, InteractionContextTypes.BotDM, InteractionContextTypes.PrivateChannel];
    #defaultMemberPermissions: number | null | undefined;
    #nsfw = false;

    /** `description` is required for slash commands and ignored for user and message commands. */
    constructor(name: string, description = '') {
        super(name, description);
    }

    /** Slash, user context menu or message context menu. Default: {@link ApplicationCommandTypes.ChatInput}. */
    setCommandType(type: ApplicationCommandTypes): this {
        this.#type = type;
        return this;
    }

    /** Where the command can be installed. Default: guilds only. */
    setIntegrationTypes(types: ApplicationIntegrationTypes | ApplicationIntegrationTypes[]): this {
        this.#integrationTypes = Array.isArray(types) ? types : [types];
        return this;
    }

    /** Where the command can be used. Default: everywhere. */
    setContexts(contexts: InteractionContextTypes | InteractionContextTypes[]): this {
        this.#contexts = Array.isArray(contexts) ? contexts : [contexts];
        return this;
    }

    /** The permissions a member needs to see the command, until guild admins change it. `null` lets everyone use it; no permissions limits it to admins. */
    setMemberPermission(permission: PermissionResolvable | null): this {
        this.#defaultMemberPermissions = permission === null ? null : Number(Permission.from(permission).allow);
        return this;
    }

    setNSFW(nsfw: boolean): this {
        this.#nsfw = nsfw;
        return this;
    }

    addSubcommandGroup(name: string, description: string, callback?: (builder: SubcommandGroupBuilder) => void): this {
        const builder = new SubcommandGroupBuilder(name, description);
        callback?.(builder);
        return this.addOption(builder.toJSON());
    }

    addSubcommand(name: string, description: string, callback?: (builder: SubcommandBuilder) => void): this {
        const builder = new SubcommandBuilder(name, description);
        callback?.(builder);
        return this.addOption(builder.toJSON());
    }

    toJSON(): CommandBuilderData {
        const chatInput = this.#type === ApplicationCommandTypes.ChatInput;
        const { name_localizations, description_localizations } = this.localizations;
        return {
            type: this.#type,
            name: this.name,
            name_localizations,
            ...(chatInput ? { description: this.description, description_localizations, options: this.options } : {}),
            integration_types: this.#integrationTypes,
            contexts: this.#contexts,
            default_member_permissions: this.#defaultMemberPermissions,
            nsfw: this.#nsfw
        };
    }

    protected override addOption(option: APIValueOptionRequest | APISubcommandOptionRequest | APISubcommandGroupOptionRequest): this {
        const existing = this.options[0];
        if (existing !== undefined && isSubcommand(existing) !== isSubcommand(option)) throw new TypeError("A command can't have both subcommands and value options");
        return super.addOption(option);
    }
}
