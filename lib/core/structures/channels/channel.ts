import type { ChannelTypes } from '../../../constants';
import type { APIChannel, ClientContext } from '../../../types';
import { Base } from '../base';

/**
 * Common ground for every channel. Use {@link createChannel} to get the subclass matching a payload's `type`.
 *
 * `type` never changes on an instance: when Discord converts a channel, it is replaced with a new one of the
 * matching class.
 */
export abstract class Channel extends Base {
    readonly type: ChannelTypes;
    flags = 0;

    constructor(client: ClientContext, data: APIChannel) {
        super(client, data.id);
        this.type = data.type;
    }

    /** Applies a payload. Fields missing from `data`, and fields that do not apply to this type, are ignored. */
    patch(data: Partial<APIChannel>): void {
        if (data.flags !== undefined) this.flags = data.flags;
    }
}

/** A channel type the library has no class for yet. Only the common fields are kept. */
export class UnknownChannel extends Channel {
    readonly guildId: string | null;

    constructor(client: ClientContext, data: APIChannel, guildId: string | null) {
        super(client, data);
        this.guildId = guildId;
        this.patch(data);
    }
}
