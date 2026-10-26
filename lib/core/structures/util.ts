import type { Attachment, MessageReaction, Poll, ReactionEmoji } from '../../interfaces';
import type { APIAttachment, APIMessageReaction, APIPoll, APIReactionEmoji, ClientContext, EmojiResolvable, RESTFile, TextBasedChannel } from '../../types';
import type { Message } from './message';

export function parseTimestamp(value: string | null): number | null {
    return value === null ? null : Date.parse(value);
}

export function toAttachment(data: APIAttachment): Attachment {
    return {
        id: data.id,
        filename: data.filename,
        size: data.size,
        url: data.url,
        proxyURL: data.proxy_url,
        contentType: data.content_type ?? null,
        description: data.description ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        durationSecs: data.duration_secs ?? null,
        waveform: data.waveform ?? null,
        ephemeral: data.ephemeral ?? false,
        flags: data.flags ?? 0
    };
}

export function splitFiles<T extends { files?: RESTFile[] }>(data: string | T): [body: Omit<T, 'files'>, files: RESTFile[] | undefined] {
    if (typeof data === 'string') return [{ content: data } as unknown as Omit<T, 'files'>, undefined];
    const { files, ...body } = data;
    return [body, files];
}

/** The cached channel or thread `channelId` if it holds messages. DM channels are never cached, so `undefined` for them. */
export function getTextChannel(client: ClientContext, channelId: string, guildId: string | null): TextBasedChannel | undefined {
    if (guildId === null) return undefined;
    const guild = client.guilds.get(guildId);
    const channel = guild?.channels.get(channelId) ?? guild?.threads.get(channelId);
    return channel !== undefined && 'messages' in channel ? (channel as TextBasedChannel) : undefined;
}

/** The key a reaction with `emoji` is stored under in {@link Message.reactions}. */
export function reactionKey(emoji: APIReactionEmoji | ReactionEmoji): string {
    return emoji.id ?? emoji.name ?? '';
}

export function toReactionEmoji(data: APIReactionEmoji): ReactionEmoji {
    return { id: data.id, name: data.name, animated: data.animated ?? false };
}

export function toReaction(data: APIMessageReaction): MessageReaction {
    return {
        emoji: toReactionEmoji(data.emoji),
        count: data.count,
        normalCount: data.count_details.normal,
        burstCount: data.count_details.burst,
        me: data.me,
        meBurst: data.me_burst,
        burstColors: data.burst_colors
    };
}

export function toPoll(data: APIPoll): Poll {
    const counts = new Map(data.results?.answer_counts.map((entry) => [entry.id, entry]));
    return {
        question: data.question.text ?? '',
        answers: data.answers.map((answer) => ({
            id: answer.answer_id,
            text: answer.poll_media.text ?? null,
            emoji: answer.poll_media.emoji === undefined ? null : toReactionEmoji(answer.poll_media.emoji),
            voteCount: counts.get(answer.answer_id)?.count ?? 0,
            meVoted: counts.get(answer.answer_id)?.me_voted ?? false
        })),
        expiresAt: parseTimestamp(data.expiry ?? null),
        allowMultiselect: data.allow_multiselect,
        layoutType: data.layout_type,
        finalized: data.results?.is_finalized ?? false
    };
}

export function emojiParam(emoji: EmojiResolvable): string {
    if (typeof emoji === 'string') return emoji;
    return emoji.id === null ? (emoji.name ?? '') : `${emoji.name ?? '_'}:${emoji.id}`;
}

/** Counts one user's reaction on a message. `self` is whether the user is the client's own. */
export function applyReactionAdd(message: Message, emoji: APIReactionEmoji, burst: boolean, burstColors: string[], self: boolean): MessageReaction {
    const key = reactionKey(emoji);
    let reaction = message.reactions.get(key);
    if (reaction === undefined) {
        reaction = { emoji: toReactionEmoji(emoji), count: 0, normalCount: 0, burstCount: 0, me: false, meBurst: false, burstColors: [] };
        message.reactions.set(key, reaction);
    }
    reaction.count++;
    if (burst) {
        reaction.burstCount++;
        if (burstColors.length > 0) reaction.burstColors = burstColors;
        if (self) reaction.meBurst = true;
    } else {
        reaction.normalCount++;
        if (self) reaction.me = true;
    }
    return reaction;
}

/** Uncounts one user's reaction on a message, dropping the reaction once nobody is left. `self` is whether the user is the client's own. */
export function applyReactionRemove(message: Message, emoji: APIReactionEmoji, burst: boolean, self: boolean): MessageReaction | null {
    const key = reactionKey(emoji);
    const reaction = message.reactions.get(key);
    if (reaction === undefined) return null;
    reaction.count = Math.max(0, reaction.count - 1);
    if (burst) {
        reaction.burstCount = Math.max(0, reaction.burstCount - 1);
        if (self) reaction.meBurst = false;
    } else {
        reaction.normalCount = Math.max(0, reaction.normalCount - 1);
        if (self) reaction.me = false;
    }
    if (reaction.count === 0) message.reactions.delete(key);
    return reaction;
}

/** Counts (`delta` 1) or uncounts (`delta` -1) one user's vote on a message's poll. `self` is whether the user is the client's own. */
export function applyPollVote(message: Message, answerId: number, delta: 1 | -1, self: boolean): void {
    const answer = message.poll?.answers.find((candidate) => candidate.id === answerId);
    if (answer === undefined) return;
    answer.voteCount = Math.max(0, answer.voteCount + delta);
    if (self) answer.meVoted = delta === 1;
}
