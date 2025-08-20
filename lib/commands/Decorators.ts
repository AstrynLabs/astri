import type { RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIApplicationGuildCommandsJSONBody } from 'discord-api-types/v10';
import CommandBuilder from '../builders/CommandBuilder';

export function SlashCommand(definition: CommandBuilder | RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function <T extends new (...args: any[]) => {}>(constructor: T, _context?: ClassDecoratorContext) {
    if (definition instanceof CommandBuilder) {
      definition = definition.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody;
    }
    // @ts-expect-error -- /s
    return class extends constructor {
      id: string;
      definition: CommandBuilder | RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIApplicationGuildCommandsJSONBody;
      constructor() {
        super(definition.name);
        this.id = definition.name;
        this.definition = definition;
      }
    };
  };
}
