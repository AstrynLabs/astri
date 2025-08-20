import type { APISKU, SKUType } from 'discord-api-types/v10';
import Base from './Base';
import type Client from '../Client';
import SKUFlagBitfield from '../util/SKUFlagBitfield';

export default class SKU extends Base {
  client: Client;
  type: SKUType;
  applicationID: string;
  name: string;
  slug: string;
  flags: SKUFlagBitfield;
  constructor(data: APISKU, client: Client) {
    super(data.id);
    this.client = client;
    this.update(data);
  }

  update(data: APISKU): void {
    this.type = data.type;
    this.applicationID = data.application_id;
    this.name = data.name;
    this.slug = data.slug;
    this.flags = new SKUFlagBitfield(data.flags);
  }
}
