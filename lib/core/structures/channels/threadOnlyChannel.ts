import type { ChannelTypes } from '../../../constants';
import type { DefaultReaction, ForumTag, ThreadList, ThreadSearchResult } from '../../../interfaces';
import type { APIChannel, APIForumTag, ArchivedThreadFetchOptions, ClientContext, ForumPostCreateData, ThreadSearchOptions } from '../../../types';
import { fetchArchivedThreads, searchThreads, splitFiles } from '../util';
import { upsertThread } from './factory';
import { GuildChannel } from './guildChannel';
import type { ThreadChannel } from './threadChannel';

/** Shared fields of forum and media channels, which only hold threads (posts). */
export abstract class ThreadOnlyChannel extends GuildChannel {
    /** The guidelines shown when creating a post. */
    topic: string | null = null;
    nsfw = false;
    /** Id of the most recently created post. */
    lastMessageId: string | null = null;
    /** Slowmode for creating posts, in seconds. */
    rateLimitPerUser = 0;
    /** Minutes. */
    defaultAutoArchiveDuration: number | null = null;
    /** Slowmode, in seconds, given to new posts. */
    defaultThreadRateLimitPerUser: number | null = null;
    availableTags: ForumTag[] = [];
    defaultReactionEmoji: DefaultReaction | null = null;
    defaultSortOrder: number | null = null;

    override patch(data: Partial<APIChannel>): void {
        super.patch(data);
        if (data.topic !== undefined) this.topic = data.topic;
        if (data.nsfw !== undefined) this.nsfw = data.nsfw;
        if (data.last_message_id !== undefined) this.lastMessageId = data.last_message_id;
        if (data.rate_limit_per_user !== undefined) this.rateLimitPerUser = data.rate_limit_per_user;
        if (data.default_auto_archive_duration !== undefined) this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
        if (data.default_thread_rate_limit_per_user !== undefined) this.defaultThreadRateLimitPerUser = data.default_thread_rate_limit_per_user;
        if (data.available_tags !== undefined) this.availableTags = data.available_tags.map(toForumTag);
        if (data.default_reaction_emoji !== undefined) this.defaultReactionEmoji = data.default_reaction_emoji === null ? null : { emojiId: data.default_reaction_emoji.emoji_id, emojiName: data.default_reaction_emoji.emoji_name };
        if (data.default_sort_order !== undefined) this.defaultSortOrder = data.default_sort_order;
    }

    /** Creates a post with its starter message. Needs the send messages permission. */
    async createPost(data: ForumPostCreateData, reason?: string): Promise<ThreadChannel> {
        const [body, files] = splitFiles(data);
        const thread = await this.client.rest.post('channelThreads', this.id, body, { files, reason });
        return upsertThread(this.client, thread as APIChannel, this.guildId);
    }

    /** Fetches a page of archived posts, most recently archived first. Needs the read message history permission. */
    fetchArchivedPosts(options?: ArchivedThreadFetchOptions): Promise<ThreadList> {
        return fetchArchivedThreads(this.client, this.id, this.guildId, false, options);
    }

    /**
     * Searches the channel's posts by name or tag, archived or not.
     *
     * @throws When Discord is still indexing the channel.
     */
    searchPosts(options?: ThreadSearchOptions): Promise<ThreadSearchResult> {
        return searchThreads(this.client, this.id, this.guildId, options);
    }
}

export class ForumChannel extends ThreadOnlyChannel {
    declare readonly type: typeof ChannelTypes.GuildForum;
    /** `0` not set, `1` list view, `2` gallery view. */
    defaultForumLayout = 0;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }

    override patch(data: Partial<APIChannel>): void {
        super.patch(data);
        if (data.default_forum_layout !== undefined) this.defaultForumLayout = data.default_forum_layout;
    }
}

export class MediaChannel extends ThreadOnlyChannel {
    declare readonly type: typeof ChannelTypes.GuildMedia;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}

function toForumTag(data: APIForumTag): ForumTag {
    return { id: data.id, name: data.name, moderated: data.moderated, emojiId: data.emoji_id, emojiName: data.emoji_name };
}
