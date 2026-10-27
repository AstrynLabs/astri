import type { ApplicationCommandOptionTypes, ApplicationCommandTypes, ComponentTypes, InteractionContextTypes, InteractionTypes } from '../../constants';
import type { APIChannel } from './channel';
import type { APIEntitlement } from './entitlement';
import type { APIGuildMember } from './member';
import type { APIAttachment, APIMessage } from './message';
import type { APIRole } from './role';
import type { APIUser } from './user';

/** The member who triggered an interaction, with their permissions in the channel it came from. */
export interface APIInteractionGuildMember extends APIGuildMember {
    /** Permission bitfield, serialized as a decimal string. */
    permissions: string;
}

/** A channel as sent inside interactions: only some fields, plus the invoking user's permissions in it. */
export interface APIInteractionChannel extends Partial<APIChannel> {
    id: string;
    type: APIChannel['type'];
    /** Permission bitfield, serialized as a decimal string. */
    permissions?: string;
}

/** Users, members, roles, channels, messages and attachments referenced by an interaction's options or values, keyed by id. */
export interface APIInteractionResolvedData {
    users?: Record<string, APIUser>;
    /** The user of each member is in `users` under the same id. */
    members?: Record<string, Omit<APIInteractionGuildMember, 'user' | 'deaf' | 'mute'>>;
    roles?: Record<string, APIRole>;
    channels?: Record<string, APIInteractionChannel>;
    messages?: Record<string, APIMessage>;
    attachments?: Record<string, APIAttachment>;
}

/** An option the user filled in. Subcommands and groups carry the options under them instead of a value. */
export interface APIApplicationCommandInteractionDataOption {
    name: string;
    type: ApplicationCommandOptionTypes;
    /** Ids for user, channel, role, mentionable and attachment options. Always a string while autocompleting. */
    value?: string | number | boolean;
    options?: APIApplicationCommandInteractionDataOption[];
    /** Set on the option being autocompleted. */
    focused?: boolean;
}

export interface APIApplicationCommandInteractionData {
    id: string;
    name: string;
    type: ApplicationCommandTypes;
    resolved?: APIInteractionResolvedData;
    options?: APIApplicationCommandInteractionDataOption[];
    /** Set when the command is registered to a guild rather than globally. */
    guild_id?: string;
    /** The user or message a user or message command was used on. */
    target_id?: string;
}

export interface APIMessageComponentInteractionData {
    custom_id: string;
    component_type: ComponentTypes;
    /** Select menus only: the chosen values, or ids for user, role, mentionable and channel selects. */
    values?: string[];
    /** Select menus other than string selects only. */
    resolved?: APIInteractionResolvedData;
}

/** A component of a submitted modal. Layout components carry the ones inside them; inputs carry what was entered. */
export interface APIModalSubmitComponent {
    type: ComponentTypes;
    id?: number;
    custom_id?: string;
    /** Text inputs. */
    value?: string;
    /** Select menus, and file uploads as attachment ids. */
    values?: string[];
    /** Action rows. */
    components?: APIModalSubmitComponent[];
    /** Labels. */
    component?: APIModalSubmitComponent;
}

export interface APIModalSubmitInteractionData {
    custom_id: string;
    components: APIModalSubmitComponent[];
    resolved?: APIInteractionResolvedData;
}

export type APIInteractionData = APIApplicationCommandInteractionData | APIMessageComponentInteractionData | APIModalSubmitInteractionData;

/** Any interaction. Which of `data`, `guild_id`, `member`, `user` and `message` are present depends on `type` and where it came from. */
export interface APIInteraction {
    id: string;
    application_id: string;
    type: InteractionTypes;
    data?: APIInteractionData;
    guild?: { id: string; locale: string; features: string[] };
    guild_id?: string;
    channel?: APIInteractionChannel;
    channel_id?: string;
    /** Sent in guilds, where `user` is left out. */
    member?: APIInteractionGuildMember;
    /** Sent outside guilds. */
    user?: APIUser;
    /** Valid for 15 minutes. The initial response must be sent within 3 seconds. */
    token: string;
    version: number;
    /** Message components, and modals opened from one: the message the component is on. */
    message?: APIMessage;
    /** Permission bitfield of the application in the channel, serialized as a decimal string. */
    app_permissions: string;
    /** The invoking user's language. Left out of pings. */
    locale?: string;
    /** The guild's preferred language. Sent in guilds. */
    guild_locale?: string;
    entitlements: APIEntitlement[];
    /** Installation contexts the interaction is authorized for (`0` guild, `1` user), mapped to the guild or user id that installed the app. */
    authorizing_integration_owners: Partial<Record<'0' | '1', string>>;
    context?: InteractionContextTypes;
    /** Bytes. */
    attachment_size_limit: number;
}
