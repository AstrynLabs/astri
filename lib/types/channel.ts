import type { BaseGuildTextChannel, BaseGuildVoiceChannel, PrivateChannel, ThreadChannel } from '../core/structures';
import type { APIComponents } from './discord';
import type { RESTBody, RESTFile, RESTQuery } from './rest';

type Schemas = APIComponents['schemas'];
type ForumThreadCreateRequest = Schemas['CreateForumThreadRequest'];

/** Any channel that holds messages: text, announcement, voice and stage channels, threads, and DMs. */
export type TextBasedChannel = BaseGuildTextChannel | BaseGuildVoiceChannel | ThreadChannel | PrivateChannel;

/** Changes to a channel or thread. Fields left out are kept. Which fields apply depends on the channel's type. */
export type ChannelEditData = RESTBody<'/channels/{channel_id}', 'patch'>;

/** The permissions a permission overwrite allows and denies for one role or member. */
export type ChannelPermissionEditData = RESTBody<'/channels/{channel_id}/permissions/{overwrite_id}', 'put'>;

/** A new invite to a guild channel. */
export type InviteCreateData = Schemas['CreateGuildInviteRequest'];

/** Which messages to fetch. `around`, `before` and `after` are mutually exclusive; `limit` is 1-100, 50 by default. */
export type MessageFetchOptions = RESTQuery<'/channels/{channel_id}/messages', 'get'>;

/** Which pins to fetch. `before` is an ISO 8601 pin timestamp; `limit` is 1-50, 50 by default. */
export type PinFetchOptions = RESTQuery<'/channels/{channel_id}/messages/pins', 'get'>;

/** A new thread in a text or announcement channel, not started from a message. */
export type ThreadCreateData = Schemas['CreateTextThreadWithoutMessageRequest'];

/** A new thread started from a message. */
export type MessageThreadCreateData = RESTBody<'/channels/{channel_id}/messages/{message_id}/threads', 'post'>;

/** A new post in a forum or media channel, with its starter message. */
export interface ForumPostCreateData extends ForumThreadCreateRequest {
    /** Uploaded alongside the starter message. Reference them from its `attachments` or embeds as `attachment://<name>`. */
    files?: RESTFile[];
}

/** Which thread members to fetch. `with_member` also returns each one's guild member. */
export type ThreadMemberFetchOptions = RESTQuery<'/channels/{channel_id}/thread-members', 'get'>;

/** Which archived threads to fetch, most recently archived first. `before` is an ISO 8601 timestamp; `limit` is 2-100, 50 by default. */
export type ArchivedThreadFetchOptions = RESTQuery<'/channels/{channel_id}/threads/archived/public', 'get'>;

/** Which archived private threads the client joined to fetch. `before` is a thread id; `limit` is 2-100, 50 by default. */
export type JoinedArchivedThreadFetchOptions = RESTQuery<'/channels/{channel_id}/users/@me/threads/archived/private', 'get'>;

/** How to search a channel's threads: by `name`, by `tag`, archived or not, sorted and paged with `limit` and `offset`. */
export type ThreadSearchOptions = RESTQuery<'/channels/{channel_id}/threads/search', 'get'>;

/** `with_counts` fills in the approximate member and presence counts; `guild_scheduled_event_id` fills in the event. */
export type InviteFetchOptions = RESTQuery<'/invites/{code}', 'get'>;
