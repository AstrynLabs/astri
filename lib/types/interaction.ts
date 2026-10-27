import type { Channel, ComponentInteraction, Role, User } from '../core/structures';
import type { APIComponents } from './discord';
import type { RESTFile } from './rest';

type Schemas = APIComponents['schemas'];
type WebhookInteractionRequest = Schemas['IncomingWebhookInteractionRequest'];
type WebhookUpdateRequest = Schemas['IncomingWebhookUpdateRequestPartial'];
type CallbackUpdateRequest = Schemas['IncomingWebhookUpdateForInteractionCallbackRequestPartial'];

interface InteractionFiles {
    /** Uploaded alongside the message. Reference them from `attachments` or embeds as `attachment://<name>`. */
    files?: RESTFile[];
}

/** A new message sent in response to an interaction: the initial reply or a follow-up. */
export interface InteractionMessageData extends WebhookInteractionRequest, InteractionFiles {
    /** Shorthand for setting {@link MessageFlags.Ephemeral} in `flags`. */
    ephemeral?: boolean;
}

/** Changes to the reply or a follow-up. Fields left out are kept. */
export interface InteractionEditData extends WebhookUpdateRequest, InteractionFiles {}

/** Changes to the message a component is on. Fields left out are kept. */
export interface InteractionUpdateData extends CallbackUpdateRequest, InteractionFiles {}

export interface InteractionDeferOptions {
    /** Whether the reply, once sent, is only visible to the invoking user. Default: `false`. */
    ephemeral?: boolean;
}

export type InteractionModalData = Schemas['ModalInteractionCallbackRequestData'];

/** What a select menu's values point to: strings for string selects, otherwise the resolved users, roles or channels. */
export type ComponentSelection = string[] | User[] | Role[] | Channel[] | Array<User | Role>;

export type StringSelectInteraction = ComponentInteraction & { readonly selected: string[] };
export type UserSelectInteraction = ComponentInteraction & { readonly selected: User[] };
export type RoleSelectInteraction = ComponentInteraction & { readonly selected: Role[] };
export type MentionableSelectInteraction = ComponentInteraction & { readonly selected: Array<User | Role> };
export type ChannelSelectInteraction = ComponentInteraction & { readonly selected: Channel[] };

/** An autocomplete suggestion. `value` is what the option is set to when it is picked. */
export interface AutocompleteChoice<T extends string | number = string | number> {
    name: string;
    name_localizations?: Record<string, string> | null;
    value: T;
}
