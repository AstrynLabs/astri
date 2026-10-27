import type { ThreadChannel } from '../core/structures';

export interface ForumTag {
    id: string;
    name: string;
    /** Only members with the manage threads permission can apply it. */
    moderated: boolean;
    emojiId: string | null;
    emojiName: string | null;
}

export interface DefaultReaction {
    emojiId: string | null;
    emojiName: string | null;
}

/** A page of threads. The client's membership in each it joined is cached on the thread. */
export interface ThreadList {
    threads: ThreadChannel[];
    /** Whether more threads are left to fetch. */
    hasMore: boolean;
}

export interface ThreadSearchResult extends ThreadList {
    /** Threads matching the search across every page. */
    totalResults: number;
}
