import type { components } from './openapi';

type Schemas = components['schemas'];

export type APIActionRowRequest = Schemas['ActionRowComponentForMessageRequest'];
/** A button or select menu in a message action row. */
export type APIActionRowChildRequest = APIActionRowRequest['components'][number];
export type APIButtonRequest = Schemas['ButtonComponentForMessageRequest'];
export type APIComponentEmojiRequest = Schemas['ComponentEmojiForRequest'];
export type APIStringSelectRequest = Schemas['StringSelectComponentForMessageRequest'];
export type APIChannelSelectRequest = Schemas['ChannelSelectComponentForMessageRequest'];
export type APIRoleSelectRequest = Schemas['RoleSelectComponentForMessageRequest'];
export type APIUserSelectRequest = Schemas['UserSelectComponentForMessageRequest'];
export type APIMentionableSelectRequest = Schemas['MentionableSelectComponentForMessageRequest'];
export type APIContainerRequest = Schemas['ContainerComponentForMessageRequest'];
/** A component that can be placed in a container. */
export type APIContainerChildRequest = APIContainerRequest['components'][number];
/** A component that can be placed at the top level of a message. */
export type APIMessageComponentRequest = APIContainerChildRequest | APIContainerRequest;
export type APISectionRequest = Schemas['SectionComponentForMessageRequest'];
export type APISectionAccessoryRequest = APISectionRequest['accessory'];
export type APIThumbnailRequest = Schemas['ThumbnailComponentForMessageRequest'];
export type APITextDisplayRequest = Schemas['TextDisplayComponentForMessageRequest'];
export type APISeparatorRequest = Schemas['SeparatorComponentForMessageRequest'];
export type APIFileRequest = Schemas['FileComponentForMessageRequest'];
export type APIMediaGalleryRequest = Schemas['MediaGalleryComponentForMessageRequest'];
export type APIMediaGalleryItemRequest = Schemas['MediaGalleryItemForMessageRequest'];
/** Media by URL. Use `attachment://<name>` to point at a file uploaded with the message. */
export type APIUnfurledMediaRequest = Schemas['UnfurledMediaRequest'];
export type APIModalActionRowRequest = Schemas['ActionRowComponentForModalRequest'];
export type APITextInputRequest = Schemas['TextInputComponentForModalRequest'];
/** A component that can be placed at the top level of a modal. */
export type APIModalComponentRequest = Schemas['ModalInteractionCallbackRequestData']['components'][number];
export type APIModalTextDisplayRequest = Schemas['TextDisplayComponentForModalRequest'];
export type APILabelRequest = Schemas['LabelComponentForModalRequest'];
/** An input that can be placed in a label. */
export type APILabelChildRequest = APILabelRequest['component'];
export type APIModalStringSelectRequest = Schemas['StringSelectComponentForModalRequest'];
export type APIModalChannelSelectRequest = Schemas['ChannelSelectComponentForModalRequest'];
export type APIModalRoleSelectRequest = Schemas['RoleSelectComponentForModalRequest'];
export type APIModalUserSelectRequest = Schemas['UserSelectComponentForModalRequest'];
export type APIModalMentionableSelectRequest = Schemas['MentionableSelectComponentForModalRequest'];
export type APIFileUploadRequest = Schemas['FileUploadComponentForModalRequest'];
export type APIRadioGroupRequest = Schemas['RadioGroupComponentForModalRequest'];
export type APICheckboxGroupRequest = Schemas['CheckboxGroupComponentForModalRequest'];
export type APICheckboxRequest = Schemas['CheckboxComponentForModalRequest'];
