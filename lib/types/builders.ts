import type { ButtonStyles } from '../constants';
import type { ApplicationCommandCreateData } from './applicationCommand';
import type {
    APIButtonRequest,
    APIChannelOptionRequest,
    APIChannelSelectRequest,
    APICheckboxGroupRequest,
    APICheckboxRequest,
    APIComponentEmojiRequest,
    APIFileRequest,
    APIFileUploadRequest,
    APIIntegerOptionRequest,
    APIMentionableSelectRequest,
    APIMessageComponentRequest,
    APIModalChannelSelectRequest,
    APIModalMentionableSelectRequest,
    APIModalRoleSelectRequest,
    APIModalStringSelectRequest,
    APIModalUserSelectRequest,
    APINumberOptionRequest,
    APIRadioGroupRequest,
    APIRichEmbedAuthor,
    APIRoleSelectRequest,
    APISeparatorRequest,
    APIStringChoiceRequest,
    APIStringOptionRequest,
    APIStringSelectRequest,
    APITextInputRequest,
    APIThumbnailRequest,
    APIUserSelectRequest
} from './discord';

/** A command built by `CommandBuilder`. `nsfw` is missing from Discord's spec but accepted by the API. */
export type CommandBuilderData = ApplicationCommandCreateData & { nsfw?: boolean };

/** A string option. Plain string choices get a value made by lowercasing them and replacing spaces with `_`. */
export type StringOptionData = Omit<APIStringOptionRequest, 'type' | 'choices'> & { choices?: Array<string | APIStringChoiceRequest> };

export type IntegerOptionData = Omit<APIIntegerOptionRequest, 'type'>;

export type NumberOptionData = Omit<APINumberOptionRequest, 'type'>;

/** Channel types a channel option accepts. */
export type CommandOptionChannelTypes = NonNullable<APIChannelOptionRequest['channel_types']>;

/** A unicode emoji, a custom one as `<:name:id>`, `<a:name:id>` or `name:id`, or an emoji object. */
export type ComponentEmojiResolvable = string | APIComponentEmojiRequest;

/** A button that sends an interaction when clicked. */
export interface NormalButtonData extends Pick<APIButtonRequest, 'id' | 'label' | 'disabled'> {
    style: Exclude<ButtonStyles, typeof ButtonStyles.Link | typeof ButtonStyles.Premium>;
    custom_id: string;
    emoji?: ComponentEmojiResolvable;
}

/** A button that opens a link. */
export interface URLButtonData extends Pick<APIButtonRequest, 'id' | 'label' | 'disabled'> {
    url: string;
}

/** A button that opens the purchase flow for a SKU. */
export interface PremiumButtonData extends Pick<APIButtonRequest, 'id' | 'disabled'> {
    sku_id: string;
}

export type StringSelectData = Omit<APIStringSelectRequest, 'type'>;

/** A channel select menu. `default_values` are channel ids. */
export type ChannelSelectData = Omit<APIChannelSelectRequest, 'type' | 'default_values'> & { default_values?: string[] };

/** A role select menu. `default_values` are role ids. */
export type RoleSelectData = Omit<APIRoleSelectRequest, 'type' | 'default_values'> & { default_values?: string[] };

/** A user select menu. `default_values` are user ids. */
export type UserSelectData = Omit<APIUserSelectRequest, 'type' | 'default_values'> & { default_values?: string[] };

export type MentionableSelectData = Omit<APIMentionableSelectRequest, 'type'>;

export type SeparatorData = Omit<APISeparatorRequest, 'type'>;

export type FileData = Omit<APIFileRequest, 'type' | 'file'>;

export type ThumbnailData = Omit<APIThumbnailRequest, 'type' | 'media'>;

export type TextInputData = Omit<APITextInputRequest, 'type'>;

/** The flags and components of a Components V2 message. Spread it into a message, reply or webhook body. */
export interface ComponentsV2MessageData {
    flags: number;
    components: APIMessageComponentRequest[];
}

/** A text input in a label. Its `label` is left out, since the label around it provides one. */
export type LabelTextInputData = Omit<APITextInputRequest, 'type' | 'label'>;

export type ModalStringSelectData = Omit<APIModalStringSelectRequest, 'type'>;

/** A channel select menu in a modal. `default_values` are channel ids. */
export type ModalChannelSelectData = Omit<APIModalChannelSelectRequest, 'type' | 'default_values'> & { default_values?: string[] };

/** A role select menu in a modal. `default_values` are role ids. */
export type ModalRoleSelectData = Omit<APIModalRoleSelectRequest, 'type' | 'default_values'> & { default_values?: string[] };

/** A user select menu in a modal. `default_values` are user ids. */
export type ModalUserSelectData = Omit<APIModalUserSelectRequest, 'type' | 'default_values'> & { default_values?: string[] };

export type ModalMentionableSelectData = Omit<APIModalMentionableSelectRequest, 'type'>;

/** `file_types` limits which files can be picked, e.g. `['image/png']`. */
export type FileUploadData = Omit<APIFileUploadRequest, 'type'>;

export type RadioGroupData = Omit<APIRadioGroupRequest, 'type'>;

export type CheckboxGroupData = Omit<APICheckboxGroupRequest, 'type'>;

export type CheckboxData = Omit<APICheckboxRequest, 'type'>;

/** An embed's author. `url` makes the name a link, and `icon_url` shows a small image beside it. */
export type EmbedAuthorData = Omit<APIRichEmbedAuthor, 'name'> & { name: string };

/** An RGB color as a number, e.g. `0x5865f2`, or a hex string, e.g. `#5865f2`. */
export type ColorResolvable = number | `#${string}`;
