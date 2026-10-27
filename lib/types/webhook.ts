import type { APIComponents } from './discord';
import type { RESTBody, RESTFile } from './rest';

type Schemas = APIComponents['schemas'];
type WebhookExecuteRequest = Schemas['IncomingWebhookRequestPartial'];
type WebhookUpdateRequest = Schemas['IncomingWebhookUpdateRequestPartial'];

/** Changes to a webhook. Fields left out are kept. Moving it to another channel needs the bot token, not the webhook token. */
export type WebhookEditData = RESTBody<'/webhooks/{webhook_id}', 'patch'>;

/** A message sent through a webhook. */
export interface WebhookMessageCreateData extends WebhookExecuteRequest {
    /** Uploaded alongside the message. Reference them from `attachments` or embeds as `attachment://<name>`. */
    files?: RESTFile[];
    /** Sends the message in this thread of the webhook channel. */
    threadId?: string;
}

/** Changes to a message the webhook sent. Fields left out are kept. */
export interface WebhookMessageEditData extends WebhookUpdateRequest {
    /** Uploaded alongside the message. Reference them from `attachments` or embeds as `attachment://<name>`. */
    files?: RESTFile[];
}

/** A new incoming webhook. `avatar` is a data URI. */
export type WebhookCreateData = RESTBody<'/channels/{channel_id}/webhooks', 'post'>;
