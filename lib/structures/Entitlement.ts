import type { APIEntitlement, EntitlementType } from 'discord-api-types/v10';
import type Client from '../Client';
import Base from './Base';

export default class Entitlement extends Base {
  client: Client;
  skuID: string;
  userID?: string;
  guildID?: string;
  applicationID: string;
  type: EntitlementType;
  deleted: boolean;
  startsAt?: number;
  endsAt?: number;
  constructor(data: APIEntitlement, client: Client) {
    super(data.id);
    this.client = client;
    this.update(data);
  }

  update(data: APIEntitlement) {
    this.skuID = data.sku_id;
    this.userID = data.user_id;
    this.guildID = data.guild_id;
    this.applicationID = data.application_id;
    this.type = data.type;
    this.deleted = data.deleted;
    this.startsAt = data.starts_at ? Date.parse(data.starts_at) : undefined;
    this.endsAt = data.ends_at ? Date.parse(data.ends_at) : undefined;
  }

  /**
   * Get SKU from cache. Must call client.loadSKUs first to populate cache
   *
   * @readonly
   * @memberof Entitlement
   */
  get SKU() {
    return this.client.SKUs.get(this.skuID);
  }
}
