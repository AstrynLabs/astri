import { ApplicationCommandOptionTypes, ButtonStyles, ComponentTypes } from '../constants';
import type { APIApplicationCommandOptionRequest, APIButtonRequest, APIComponentEmojiRequest, APIStringChoiceRequest, ComponentEmojiResolvable, NormalButtonData, PremiumButtonData, URLButtonData } from '../types';

export function withPrefix(prefix: string | null, customId: string): string {
    return prefix === null ? customId : `${prefix}:${customId}`;
}

export function toComponentEmoji(emoji: ComponentEmojiResolvable): APIComponentEmojiRequest {
    if (typeof emoji !== 'string') return emoji;
    const custom = /^(?:<a?:)?(\w+):(\d+)>?$/.exec(emoji);
    return custom === null ? { name: emoji } : { name: custom[1], id: custom[2] };
}

export function toNormalButton({ emoji, custom_id, ...data }: NormalButtonData, prefix: string | null): APIButtonRequest {
    return { type: ComponentTypes.Button, ...data, custom_id: withPrefix(prefix, custom_id), emoji: emoji === undefined ? undefined : toComponentEmoji(emoji) };
}

export function toURLButton(data: URLButtonData): APIButtonRequest {
    return { type: ComponentTypes.Button, style: ButtonStyles.Link, ...data };
}

export function toPremiumButton(data: PremiumButtonData): APIButtonRequest {
    return { type: ComponentTypes.Button, style: ButtonStyles.Premium, ...data };
}

export function toDefaultValues<T extends 'channel' | 'role' | 'user'>(ids: string[] | undefined, type: T): Array<{ id: string; type: T }> | undefined {
    return ids?.length ? ids.map((id) => ({ id, type })) : undefined;
}

export function isSubcommand(option: APIApplicationCommandOptionRequest): boolean {
    return option.type === ApplicationCommandOptionTypes.Subcommand || option.type === ApplicationCommandOptionTypes.SubcommandGroup;
}

export function toStringChoice(choice: string | APIStringChoiceRequest): APIStringChoiceRequest {
    return typeof choice === 'string' ? { name: choice, value: choice.replace(/ /g, '_').toLowerCase() } : choice;
}
