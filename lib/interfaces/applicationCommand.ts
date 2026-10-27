import type { ApplicationCommandOptionTypes, ApplicationCommandPermissionTypes } from '../constants';

export interface ApplicationCommandOptionChoice {
    name: string;
    nameLocalizations: Record<string, string> | null;
    value: string | number;
}

/** A command option. Fields that do not apply to its `type` are empty or `null`. */
export interface ApplicationCommandOption {
    type: ApplicationCommandOptionTypes;
    name: string;
    nameLocalizations: Record<string, string> | null;
    description: string;
    descriptionLocalizations: Record<string, string> | null;
    required: boolean;
    choices: ApplicationCommandOptionChoice[];
    /** Subcommands and groups only. */
    options: ApplicationCommandOption[];
    /** Channel options only. Empty allows every type. */
    channelTypes: number[];
    minValue: number | null;
    maxValue: number | null;
    minLength: number | null;
    maxLength: number | null;
    autocomplete: boolean;
}

export interface ApplicationCommandPermission {
    /** Role, user or channel id. The guild id stands for `@everyone`, and the guild id minus one for every channel. */
    id: string;
    type: ApplicationCommandPermissionTypes;
    /** Whether the command is allowed. */
    permission: boolean;
}

/** Permission overrides for commands in one guild. */
export interface GuildApplicationCommandPermissions {
    /** The command id, or the application id when they apply to every command. */
    id: string;
    applicationId: string;
    guildId: string;
    permissions: ApplicationCommandPermission[];
}
