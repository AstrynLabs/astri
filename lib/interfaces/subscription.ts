import type { SubscriptionStatuses } from '../constants';

/** A user's recurring payment for one or more of the application's SKUs. */
export interface Subscription {
    id: string;
    userId: string;
    skuIds: string[];
    /** The SKUs the user will be subscribed to at renewal, or `null` if they stay the same. */
    renewalSkuIds: string[] | null;
    entitlementIds: string[];
    /** Unix ms the current period started. */
    currentPeriodStart: number;
    /** Unix ms the current period ends. */
    currentPeriodEnd: number;
    status: SubscriptionStatuses;
    /** Unix ms the subscription was canceled, or `null`. */
    canceledAt: number | null;
    /** ISO 3166-1 alpha-2 country code of the payment source. Only sent to some applications. */
    country: string | null;
}
