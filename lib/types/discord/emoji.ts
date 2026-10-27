import type { APIUser } from './user';

/** A custom emoji belonging to a guild. Unlike a reaction emoji, its `id` is always set. */
export interface APIGuildEmoji {
    id: string;
    name: string;
    roles?: string[];
    /** Who uploaded it. Only present with the manage expressions permission. */
    user?: APIUser;
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
    available?: boolean;
}
