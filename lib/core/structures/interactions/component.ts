import { InteractionCallbackTypes, type ComponentTypes, type InteractionTypes } from '../../../constants';
import type { APIInteraction, APIMessage, APIMessageComponentInteractionData, ClientContext, InteractionModalData, InteractionUpdateData } from '../../../types';
import { RepliableInteraction } from './interaction';
import { InteractionResolved } from './resolved';
import { editBody } from './util';

/** A button was clicked or a select menu was submitted. */
export class ComponentInteraction extends RepliableInteraction {
    declare readonly type: typeof InteractionTypes.MessageComponent;
    readonly customId: string;
    readonly componentType: ComponentTypes;
    /** Select menus only: the chosen values, or ids for user, role, mentionable and channel selects. */
    readonly values: string[];
    /** User, role, mentionable and channel selects only. */
    readonly resolved: InteractionResolved;
    /** The message the component is on. */
    readonly message: APIMessage;

    constructor(client: ClientContext, data: APIInteraction) {
        super(client, data);
        const component = data.data as APIMessageComponentInteractionData;
        this.customId = component.custom_id;
        this.componentType = component.component_type;
        this.values = component.values ?? [];
        this.resolved = new InteractionResolved(client, component.resolved, this.guildId);
        this.message = data.message!;
    }

    /** Acknowledges the interaction without a loading state, to edit the message later through {@link editReply}. */
    async deferUpdate(): Promise<void> {
        await this.sendCallback({ type: InteractionCallbackTypes.DeferredUpdateMessage });
        this.deferred = true;
    }

    /** Responds by editing the message the component is on. */
    update(data: string | InteractionUpdateData): Promise<void> {
        const [body, files] = editBody(data);
        return this.sendCallback({ type: InteractionCallbackTypes.UpdateMessage, data: body }, files);
    }

    /** Responds by opening a modal. Its submission arrives as a {@link ModalSubmitInteraction}. */
    showModal(data: InteractionModalData): Promise<void> {
        return this.sendCallback({ type: InteractionCallbackTypes.Modal, data });
    }
}
