import { SKUFlags } from 'discord-api-types/v10';
import Bitfield from './Bitfield';

export default class SKUFlagBitfield extends Bitfield<typeof SKUFlags> {
  flags = SKUFlags;
}
