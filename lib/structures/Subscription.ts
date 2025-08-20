import type { APISubscription, SubscriptionStatus } from 'discord-api-types/v10';
import type Client from '../Client';
import Base from './Base';

export default class Subscription extends Base {
  client: Client;
  skuIDs: string[];
  entitlementIDs: string[];
  currentPeriodStart: string;
  currentPeriodEnd: string;
  status: SubscriptionStatus;
  canceledAt: string | null;
  country?: string;

  constructor(data: APISubscription, client: Client) {
    super(data.id);
    this.client = client;
    this.update(data);
  }

  update(data: APISubscription) {
    this.skuIDs = data.sku_ids;
    this.entitlementIDs = data.entitlement_ids;
    this.currentPeriodStart = data.current_period_start;
    this.currentPeriodEnd = data.current_period_end;
    this.status = data.status;
    this.canceledAt = data.canceled_at;
    this.country = data.country;
  }

  /**
   * Get SKUs from cache. Must call client.loadSKUs first to populate cache
   *
   * @readonly
   * @memberof Subscription
   */
  get SKUs() {
    return this.skuIDs.map((id) => this.client.SKUs.get(id));
  }
}
