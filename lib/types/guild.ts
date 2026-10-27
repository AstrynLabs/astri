import type { RESTBody, RESTQuery } from './rest';

/** Changes to a guild. Fields left out are kept. */
export type GuildEditData = RESTBody<'/guilds/{guild_id}', 'patch'>;

/** A new channel in a guild. */
export type GuildChannelCreateData = RESTBody<'/guilds/{guild_id}/channels', 'post'>;

/** A new role. Everything is optional; Discord names it `new role`. */
export type RoleCreateData = RESTBody<'/guilds/{guild_id}/roles', 'post'>;

/** Changes to a role. Fields left out are kept. */
export type RoleEditData = RESTBody<'/guilds/{guild_id}/roles/{role_id}', 'patch'>;

/** A new custom emoji. `image` is a data URI. */
export type EmojiCreateData = RESTBody<'/guilds/{guild_id}/emojis', 'post'>;

/** Changes to a custom emoji. Fields left out are kept. */
export type EmojiEditData = RESTBody<'/guilds/{guild_id}/emojis/{emoji_id}', 'patch'>;

/** Changes to a member. Fields left out are kept. Each field needs its own permission. */
export type MemberEditData = RESTBody<'/guilds/{guild_id}/members/{user_id}', 'patch'>;

/** Which members to fetch, in user id order. `limit` is 1-1000, 1 by default. */
export type MemberFetchOptions = RESTQuery<'/guilds/{guild_id}/members', 'get'>;

/** Which bans to fetch, in user id order. `limit` is 1-1000, 1000 by default. */
export type BanFetchOptions = RESTQuery<'/guilds/{guild_id}/bans', 'get'>;

/** How to ban. `delete_message_seconds` (0-604800) also deletes the user's recent messages. */
export type BanOptions = RESTBody<'/guilds/{guild_id}/bans/{user_id}', 'put'>;

/** Up to 200 users to ban at once. */
export type BulkBanData = RESTBody<'/guilds/{guild_id}/bulk-ban', 'post'>;

/** Who to kick for inactivity: members inactive for `days` (1-30, 7 by default) and holding no roles besides `include_roles`. */
export type PruneOptions = RESTBody<'/guilds/{guild_id}/prune', 'post'>;

/** Who a prune would kick. See {@link PruneOptions}. */
export type PruneCountOptions = RESTQuery<'/guilds/{guild_id}/prune', 'get'>;

/** `with_counts` fills in the approximate member and presence counts. */
export type GuildFetchOptions = RESTQuery<'/guilds/{guild_id}', 'get'>;

/** Which audit log entries to fetch: filtered by `user_id` or `action_type`, paged with `before` or `after`. `limit` is 1-100, 50 by default. */
export type AuditLogFetchOptions = RESTQuery<'/guilds/{guild_id}/audit-logs', 'get'>;

/** New positions, and optionally parents, for some of a guild's channels. Channels left out keep theirs. */
export type ChannelPositionsData = RESTBody<'/guilds/{guild_id}/channels', 'patch'>;

/** New positions for some of a guild's roles. Roles left out keep theirs. */
export type RolePositionsData = RESTBody<'/guilds/{guild_id}/roles', 'patch'>;

/** Adds a user to the guild with an OAuth2 `access_token` that has the `guilds.join` scope. */
export type MemberAddData = RESTBody<'/guilds/{guild_id}/members/{user_id}', 'put'>;

/** Changes to the welcome screen. Fields left out are kept. */
export type WelcomeScreenEditData = RESTBody<'/guilds/{guild_id}/welcome-screen', 'patch'>;

/** Changes to the widget settings. Fields left out are kept. */
export type WidgetSettingsEditData = RESTBody<'/guilds/{guild_id}/widget', 'patch'>;

/** The full onboarding setup. Prompts left out are deleted. */
export type OnboardingEditData = RESTBody<'/guilds/{guild_id}/onboarding', 'put'>;

/** When invites and DMs are paused until, as ISO 8601 timestamps at most 24 hours ahead. `null` lifts a pause. */
export type IncidentActionsEditData = RESTBody<'/guilds/{guild_id}/incident-actions', 'put'>;

/** What to search for: content, authors, mentions, attachments and more, sorted and paged with `limit` (1-25) and `offset`. */
export type MessageSearchOptions = Omit<NonNullable<RESTQuery<'/guilds/{guild_id}/messages/search', 'get'>>, 'guild_id'>;
