import { ChannelFlags } from 'discord-api-types/v10';
import Bitfield from './Bitfield';

export default class ChannelFlagBitfield extends Bitfield<typeof ChannelFlags> {
  flags = ChannelFlags;
}
