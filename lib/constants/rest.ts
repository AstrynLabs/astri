/** REST API version the library speaks. */
export const API_VERSION = 10;

/** Default REST base URL, without the version segment. */
export const DEFAULT_API_URL = 'https://discord.com/api';

/** Default milliseconds before a request attempt is aborted. */
export const DEFAULT_REST_TIMEOUT = 15_000;

/** Default retries after a network error, timeout or 5xx response. */
export const DEFAULT_REST_RETRIES = 3;

/** Default authenticated requests allowed per {@link GLOBAL_RATE_LIMIT_WINDOW}, across all routes. */
export const DEFAULT_GLOBAL_RATE_LIMIT = 50;

/** Milliseconds the global rate limit counts requests over. */
export const GLOBAL_RATE_LIMIT_WINDOW = 1_000;

/** Path parameters that split a route into separate rate limit buckets. */
export const RATE_LIMIT_MAJOR_PARAMS: ReadonlySet<string> = new Set(['channel_id', 'guild_id', 'webhook_id', 'webhook_token', 'interaction_id', 'interaction_token']);

/** Matches route templates authenticated by a webhook or interaction token in the URL, not the bot token. */
export const TOKEN_ROUTE_PATTERN = /\{(webhook|interaction)_token\}/;

/** Matches each `{placeholder}` in a route template, capturing its name. */
export const ROUTE_PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

/** Milliseconds between sweeps of idle rate limit buckets. */
export const BUCKET_SWEEP_INTERVAL = 60_000;

/** Milliseconds before the first retry. Each further retry doubles it, up to {@link MAX_RETRY_DELAY}. */
export const RETRY_BASE_DELAY = 500;

/** Longest wait between retries, in milliseconds. */
export const MAX_RETRY_DELAY = 10_000;
