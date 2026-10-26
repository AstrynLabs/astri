import type { Emoji } from '../core/structures';
import type { ReactionEmoji } from '../interfaces';
import type { APIComponents, GatewayMessageCreateData } from './discord';
import type { RESTFile } from './rest';

type Schemas = APIComponents['schemas'];
type MessageCreateRequest = Schemas['MessageCreateRequest'];
type MessageEditRequest = Schemas['MessageEditRequestPartial'];

/** A new message: a reply, or a message sent to a channel. */
export interface MessageCreateData extends MessageCreateRequest {
    /** Uploaded alongside the message. Reference them from `attachments` or embeds as `attachment://<name>`. */
    files?: RESTFile[];
}

/** Changes to a message. Fields left out are kept. */
export interface MessageEditData extends MessageEditRequest {
    /** Uploaded alongside the message. Reference them from `attachments` or embeds as `attachment://<name>`. */
    files?: RESTFile[];
}

/** A message payload from the gateway or REST. Only the id, channel and author are always present. */
export type MessageData = Partial<GatewayMessageCreateData> & Pick<GatewayMessageCreateData, 'id' | 'channel_id' | 'author'>;

/** An emoji to react with: a unicode emoji, `name:id` for a custom one, or a guild or reaction emoji. */
export type EmojiResolvable = string | Emoji | ReactionEmoji;
