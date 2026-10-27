import type { ApplicationCommandOptionTypes } from '../../constants';
import type { components } from './openapi';

type Schemas = components['schemas'];

export interface APIApplicationCommandOptionChoice {
    name: string;
    name_localizations?: Record<string, string> | null;
    value: string | number;
}

/** Any command option. Which optional fields are present depends on `type`. */
export interface APIApplicationCommandOption {
    type: ApplicationCommandOptionTypes;
    name: string;
    name_localizations?: Record<string, string> | null;
    description: string;
    description_localizations?: Record<string, string> | null;
    required?: boolean | null;
    choices?: APIApplicationCommandOptionChoice[] | null;
    /** Subcommands and groups only. */
    options?: APIApplicationCommandOption[] | null;
    /** Channel options only. */
    channel_types?: number[] | null;
    min_value?: number | null;
    max_value?: number | null;
    min_length?: number | null;
    max_length?: number | null;
    autocomplete?: boolean | null;
}

export interface APIApplicationCommand extends Omit<Schemas['ApplicationCommandResponse'], 'options'> {
    options?: APIApplicationCommandOption[];
}

export type APIApplicationCommandPermission = Schemas['CommandPermissionResponse'];

/** Permission overrides for commands in one guild. `id` is the command id, or the application id when they apply to every command. */
export type APIGuildApplicationCommandPermissions = Schemas['CommandPermissionsResponse'];
