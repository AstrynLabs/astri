export interface PermissionOverwrite {
    /** Role or user id. */
    id: string;
    /** `0` for a role, `1` for a member. */
    type: 0 | 1;
    allow: bigint;
    deny: bigint;
}

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
