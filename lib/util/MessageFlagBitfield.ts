import { MessageFlags } from 'discord-api-types/v10';
import Bitfield from './Bitfield';

export default class MessageFlagBitfield extends Bitfield<typeof MessageFlags> {
  flags = MessageFlags;

  get isEphemeral() {
    return this.has(MessageFlags.Ephemeral);
  }
}
