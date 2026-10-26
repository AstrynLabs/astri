import { InteractionCallbackTypes, type InteractionTypes } from '../../../constants';
import type { APIInteraction, APIMessage, APIModalSubmitComponent, APIModalSubmitInteractionData, ClientContext, InteractionUpdateData } from '../../../types';
import { RepliableInteraction } from './interaction';
import { InteractionResolved } from './resolved';
import { editBody } from './util';

/** A modal opened with `showModal` was submitted. */
export class ModalSubmitInteraction extends RepliableInteraction {
    declare readonly type: typeof InteractionTypes.ModalSubmit;
    readonly customId: string;
    /** The submitted components, nested as the modal laid them out. */
    readonly components: APIModalSubmitComponent[];
    /** Every input in the modal, keyed by `custom_id`. */
    readonly fields = new Map<string, APIModalSubmitComponent>();
    /** What the modal's user, role, mentionable and channel selects and file uploads point to. */
    readonly resolved: InteractionResolved;
    /** The message of the component that opened the modal, or `null` when a command opened it. */
    readonly message: APIMessage | null;

    constructor(client: ClientContext, data: APIInteraction) {
        super(client, data);
        const modal = data.data as APIModalSubmitInteractionData;
        this.customId = modal.custom_id;
        this.components = modal.components;
        this.resolved = new InteractionResolved(client, modal.resolved, this.guildId);
        this.message = data.message ?? null;
        collectFields(this.components, this.fields);
    }

    /** The text entered in a text input, or `null` if there is no such input. */
    getTextValue(customId: string): string | null {
        return this.fields.get(customId)?.value ?? null;
    }

    /** The values chosen in a select menu, or the attachment ids of a file upload. `null` if there is no such input. */
    getValues(customId: string): string[] | null {
        return this.fields.get(customId)?.values ?? null;
    }

    /** Only when a component opened the modal: acknowledges without a loading state, to edit its message later through {@link editReply}. */
    async deferUpdate(): Promise<void> {
        await this.sendCallback({ type: InteractionCallbackTypes.DeferredUpdateMessage });
        this.deferred = true;
    }

    /** Only when a component opened the modal: responds by editing its message. */
    update(data: string | InteractionUpdateData): Promise<void> {
        const [body, files] = editBody(data);
        return this.sendCallback({ type: InteractionCallbackTypes.UpdateMessage, data: body }, files);
    }
}

function collectFields(components: APIModalSubmitComponent[], into: Map<string, APIModalSubmitComponent>): void {
    for (const component of components) {
        if (component.custom_id !== undefined) into.set(component.custom_id, component);
        if (component.component !== undefined) collectFields([component.component], into);
        if (component.components !== undefined) collectFields(component.components, into);
    }
}
