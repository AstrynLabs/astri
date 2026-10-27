import { CommandBuilder } from '../../builders';
import { CUSTOM_ID_SEPARATOR } from '../../constants';
import type { CommandBuilderData, CommandDefinition } from '../../types';

export function definitionName(definition: CommandDefinition): string {
    return typeof definition === 'string' ? definition : definition.name;
}

export function definitionData(definition: CommandDefinition): CommandBuilderData | null {
    if (typeof definition === 'string') return null;
    return definition instanceof CommandBuilder ? definition.toJSON() : definition;
}

export function customIdCommand(customId: string): string {
    const end = customId.indexOf(CUSTOM_ID_SEPARATOR);
    return end === -1 ? customId : customId.slice(0, end);
}
