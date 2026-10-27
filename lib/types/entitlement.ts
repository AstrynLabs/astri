import type { RESTQuery } from './rest';

/** Which entitlements to fetch: filtered by user, guild or SKUs, paged with `before` or `after`. `limit` is 1-100, 100 by default. */
export type EntitlementFetchOptions = RESTQuery<'/applications/{application_id}/entitlements', 'get'>;

/** Which subscriptions to a SKU to fetch, paged with `before` or `after`. `user_id` is required unless the client is the SKU's owner. */
export type SubscriptionFetchOptions = RESTQuery<'/skus/{sku_id}/subscriptions', 'get'>;
