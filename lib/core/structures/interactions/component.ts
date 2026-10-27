import { ComponentTypes, InteractionCallbackTypes, type InteractionTypes } from '../../../constants';
import type { APIInteraction, APIMessageComponentInteractionData, ChannelSelectInteraction, ClientContext, ComponentSelection, InteractionModalData, InteractionUpdateData, MentionableSelectInteraction, RoleSelectInteraction, StringSelectInteraction, UserSelectInteraction } from '../../../types';
import { upsertMessage, type Message } from '../message';
import { splitFiles } from '../util';
import { RepliableInteraction } from './interaction';
import { InteractionResolved } from './resolved';
import { resolveSelection } from './util';

/** A button was clicked or a select menu was submitted. */
export class ComponentInteraction extends RepliableInteraction {
    declare readonly type: typeof InteractionTypes.MessageComponent;
    readonly customId: string;
    readonly componentType: ComponentTypes;
    /** Select menus only: the chosen values, or ids for user, role, mentionable and channel selects. */
    readonly values: string[];
    /** User, role, mentionable and channel selects only. */
    readonly resolved: InteractionResolved;
    /**
     * Select menus only: the chosen values, with ids swapped for the users, roles or channels they point to. Narrow
     * it with {@link isStringSelect} and the other select checks. Empty for buttons.
     */
    readonly selected: ComponentSelection;
    /** The message the component is on. */
    readonly message: Message;

    constructor(client: ClientContext, data: APIInteraction) {
        super(client, data);
        const component = data.data as APIMessageComponentInteractionData;
        this.customId = component.custom_id;
        this.componentType = component.component_type;
        this.values = component.values ?? [];
        this.resolved = new InteractionResolved(client, component.resolved, this.guildId);
        this.selected = resolveSelection(this.componentType, this.values, this.resolved);
        this.message = upsertMessage(client, data.message!, this.guildId);
    }

    isButton(): boolean {
        return this.componentType === ComponentTypes.Button;
    }

    isStringSelect(): this is StringSelectInteraction {
        return this.componentType === ComponentTypes.StringSelect;
    }

    isUserSelect(): this is UserSelectInteraction {
        return this.componentType === ComponentTypes.UserSelect;
    }

    isRoleSelect(): this is RoleSelectInteraction {
        return this.componentType === ComponentTypes.RoleSelect;
    }

    isMentionableSelect(): this is MentionableSelectInteraction {
        return this.componentType === ComponentTypes.MentionableSelect;
    }

    isChannelSelect(): this is ChannelSelectInteraction {
        return this.componentType === ComponentTypes.ChannelSelect;
    }

    /** Acknowledges the interaction without a loading state, to edit the message later through {@link editReply}. */
    async deferUpdate(): Promise<void> {
        await this.sendCallback({ type: InteractionCallbackTypes.DeferredUpdateMessage });
        this.deferred = true;
    }

    /** Responds by editing the message the component is on. */
    update(data: string | InteractionUpdateData): Promise<void> {
        const [body, files] = splitFiles(data);
        return this.sendCallback({ type: InteractionCallbackTypes.UpdateMessage, data: body }, files);
    }

    /** Responds by opening a modal. Its submission arrives as a {@link ModalSubmitInteraction}. */
    showModal(data: InteractionModalData): Promise<void> {
        return this.sendCallback({ type: InteractionCallbackTypes.Modal, data });
    }
}
