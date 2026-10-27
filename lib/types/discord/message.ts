import type { APIGuildMember } from './member';
import type { components } from './openapi';

type Schemas = components['schemas'];

export type APIMessage = Schemas['MessageResponse'];
export type APIAttachment = Schemas['MessageAttachmentResponse'];
export type APIEmbed = Schemas['MessageEmbedResponse'];
/** An embed as sent in a request. */
export type APIRichEmbed = Schemas['RichEmbed'];
export type APIMessageComponent = APIMessage['components'][number];
export type APIStickerItem = Schemas['MessageStickerItemResponse'];
export type APIMessageReference = Schemas['MessageReferenceResponse'];
export type APIMessageSnapshot = Schemas['MessageSnapshotResponse'];
export type APIMessageReaction = Schemas['MessageReactionResponse'];
export type APIMessageInteractionMetadata = NonNullable<APIMessage['interaction_metadata']>;
export type APIPoll = Schemas['PollResponse'];
export type APIPollMedia = Schemas['PollMediaResponse'];

/** An emoji as sent in reactions and polls: custom emojis carry an id, unicode ones only a name. */
export interface APIReactionEmoji {
    id: string | null;
    name: string | null;
    animated?: boolean;
}

/** The author's guild membership as sent with gateway messages. The user is left out, since it is the author. */
export interface GatewayMessageMember extends Omit<APIGuildMember, 'user' | 'deaf' | 'mute'> {
    deaf?: boolean;
    mute?: boolean;
}
