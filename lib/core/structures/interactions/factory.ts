import { ApplicationCommandTypes, InteractionTypes } from '../../../constants';
import type { APIApplicationCommandInteractionData, APIInteraction, ClientContext } from '../../../types';
import { AutocompleteInteraction, ChatInputCommandInteraction, CommandInteraction, EntryPointCommandInteraction, MessageCommandInteraction, UserCommandInteraction } from './command';
import { ComponentInteraction } from './component';
import { UnknownInteraction } from './interaction';
import { ModalSubmitInteraction } from './modal';

/** Every interaction class {@link createInteraction} can return. Narrow with `instanceof`. */
export type AnyInteraction = ChatInputCommandInteraction | UserCommandInteraction | MessageCommandInteraction | EntryPointCommandInteraction | CommandInteraction | AutocompleteInteraction | ComponentInteraction | ModalSubmitInteraction | UnknownInteraction;

/**
 * A new interaction of the class matching `data.type`, and for commands the command's type. Interaction types
 * without a class become an {@link UnknownInteraction}, command types without one a plain {@link CommandInteraction}.
 */
export function createInteraction(client: ClientContext, data: APIInteraction): AnyInteraction {
    switch (data.type) {
        case InteractionTypes.ApplicationCommand:
            return createCommandInteraction(client, data);
        case InteractionTypes.ApplicationCommandAutocomplete:
            return new AutocompleteInteraction(client, data);
        case InteractionTypes.MessageComponent:
            return new ComponentInteraction(client, data);
        case InteractionTypes.ModalSubmit:
            return new ModalSubmitInteraction(client, data);
        default:
            return new UnknownInteraction(client, data);
    }
}

function createCommandInteraction(client: ClientContext, data: APIInteraction): CommandInteraction {
    switch ((data.data as APIApplicationCommandInteractionData).type) {
        case ApplicationCommandTypes.ChatInput:
            return new ChatInputCommandInteraction(client, data);
        case ApplicationCommandTypes.User:
            return new UserCommandInteraction(client, data);
        case ApplicationCommandTypes.Message:
            return new MessageCommandInteraction(client, data);
        case ApplicationCommandTypes.PrimaryEntryPoint:
            return new EntryPointCommandInteraction(client, data);
        default:
            return new CommandInteraction(client, data);
    }
}
