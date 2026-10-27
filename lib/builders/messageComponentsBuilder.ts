import { MessageFlags } from '../constants';
import type { APIContainerRequest, ComponentsV2MessageData } from '../types';
import { ComponentGroupBuilder, ContainerBuilder } from './components';

/**
 * Builds a Components V2 message, laid out entirely with components. Such a message cannot have `content`, `embeds`,
 * `sticker_ids` or a `poll`, and holds at most 40 components, nested ones included.
 */
export class MessageComponentsBuilder extends ComponentGroupBuilder<APIContainerRequest> {
    /** `prefix` is prepended to every `custom_id` as `<prefix>:<custom_id>`. */
    constructor(prefix: string | null = null) {
        super(prefix);
    }

    addContainer(callback?: (builder: ContainerBuilder) => void): this {
        const builder = new ContainerBuilder(this.prefix);
        callback?.(builder);
        if (builder.size > 0) this.append(builder.toJSON(), builder.size);
        return this;
    }

    toMessageData(): ComponentsV2MessageData {
        return { flags: MessageFlags.IsComponentsV2, components: this.components };
    }
}
