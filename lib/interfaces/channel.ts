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
