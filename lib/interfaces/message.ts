/** An emoji in a reaction or poll. Custom emojis have an `id`; unicode ones only a `name`, the emoji itself. */
export interface ReactionEmoji {
    id: string | null;
    /** `null` for custom emojis that were deleted. */
    name: string | null;
    animated: boolean;
}

/** Everyone who reacted to a message with one emoji. */
export interface MessageReaction {
    emoji: ReactionEmoji;
    /** Normal and super reactions together. */
    count: number;
    normalCount: number;
    burstCount: number;
    /** Whether the client's own user reacted. */
    me: boolean;
    /** Whether the client's own user super reacted. */
    meBurst: boolean;
    /** Hex colors used to render super reactions. */
    burstColors: string[];
}

export interface PollAnswer {
    id: number;
    text: string | null;
    emoji: ReactionEmoji | null;
    /** Kept current by vote events while the message is cached. Exact once the poll is finalized. */
    voteCount: number;
    /** Whether the client's own user voted for it. */
    meVoted: boolean;
}

export interface Poll {
    question: string;
    answers: PollAnswer[];
    /** Unix ms the poll ends, or `null` if it never does. */
    expiresAt: number | null;
    allowMultiselect: boolean;
    layoutType: number;
    /** Whether the votes have been counted precisely. Until then, `voteCount` may be off. */
    finalized: boolean;
}

/** One user's reaction being removed. */
export interface MessageReactionEvent {
    messageId: string;
    channelId: string;
    /** `null` outside guilds. */
    guildId: string | null;
    userId: string;
    emoji: ReactionEmoji;
    /** Whether it is a super reaction. */
    burst: boolean;
}

/** One user's reaction being added. */
export interface MessageReactionAddEvent extends MessageReactionEvent {
    /** The author of the message reacted to, when Discord sends it. */
    messageAuthorId: string | null;
    /** Super reactions only: hex colors used to render the animation. */
    burstColors: string[];
}
