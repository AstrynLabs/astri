'use strict';

import type Client from '../Client';
import { ApplicationCommandType, type APIApplicationCommandGuildInteraction, type APIApplicationCommandInteraction, type APIChatInputApplicationCommandInteraction, type APIUserApplicationCommandInteraction, type APIMessageApplicationCommandInteraction, ApplicationCommandOptionType, type APIApplicationCommandInteractionDataOption, type APIInteractionDataResolved, type APIAttachment, type APIChatInputApplicationCommandInteractionData, type APIApplicationCommandInteractionDataBasicOption } from 'discord-api-types/v10';
import Interaction from './Interaction';
import Member from './Member';
import User from './User';
import Role from './Role';
import Message from './Message';
import Collection from '../util/Collection';
import type { TextBasedChannel } from '../interfaces/Types';
import BaseChannel from './BaseChannel';
import ChannelFactory from '../factories/ChannelFactory';
import type Guild from './Guild';
import PermissionBitfield from '../util/PermissionBitfield';

export type GuildCommandInteraction = CommandInteraction & { guild: Guild; member: Member };
interface BaseArgumentType<T, V> {
  name: string;
  type: T;
  value: V;
}

type ChannelArgument = BaseArgumentType<ApplicationCommandOptionType.Channel, BaseChannel>;
type UserArgument = BaseArgumentType<ApplicationCommandOptionType.User, User>;
type RoleArgument = BaseArgumentType<ApplicationCommandOptionType.Role, Role>;
type MentionableArgument = BaseArgumentType<ApplicationCommandOptionType.Mentionable, User | Role | Member | string>;
type BooleanArgument = BaseArgumentType<ApplicationCommandOptionType.Boolean, boolean>;
type NumberArgument = BaseArgumentType<ApplicationCommandOptionType.Number, number>;
type IntegerArgument = BaseArgumentType<ApplicationCommandOptionType.Integer, number>;
type AttachmentArgument = BaseArgumentType<ApplicationCommandOptionType.Attachment, APIAttachment>;
type StringArgument = BaseArgumentType<ApplicationCommandOptionType.String, string>;
type SubCommandArgument = BaseArgumentType<ApplicationCommandOptionType.Subcommand, Array<ChannelArgument | UserArgument | RoleArgument | MentionableArgument | BooleanArgument | NumberArgument | IntegerArgument | AttachmentArgument | StringArgument>>;
type SubCommandGroupArgument = BaseArgumentType<ApplicationCommandOptionType.SubcommandGroup, SubCommandArgument[]>;

export type ArgumentType = ChannelArgument | UserArgument | RoleArgument | MentionableArgument | BooleanArgument | NumberArgument | IntegerArgument | AttachmentArgument | StringArgument | SubCommandArgument | SubCommandGroupArgument;

export default class CommandInteraction<T extends APIApplicationCommandInteraction = APIApplicationCommandInteraction> extends Interaction {
  channel: TextBasedChannel;
  guild: Guild | null = null;
  member: Member | null = null;
  user?: User;
  data: T['data'];
  command: string;
  group: string | null = null;
  subcommand: string | null = null;
  options: APIApplicationCommandInteractionDataBasicOption[] = [];
  users = new Collection(User);
  members = new Collection(Member);
  roles = new Collection(Role);
  channels = new Collection(BaseChannel);
  messages = new Collection(Message);
  appPermissions: PermissionBitfield;
  constructor(data: APIApplicationCommandGuildInteraction | APIApplicationCommandInteraction, client: Client) {
    super(data, client);

    this.channel = (this._client.getChannel(data.channel.id) ?? ChannelFactory.create(data.channel, this._client)) as TextBasedChannel;

    this.data = JSON.parse(JSON.stringify(data.data));
    this.command = this.data.name;
    if (data.guild_id !== undefined) {
      this.guild = this._client.guilds.get(data.guild_id) ?? null;
    }

    if (this.data.type === ApplicationCommandType.ChatInput) {
      if (this.data.options?.[0].type === ApplicationCommandOptionType.SubcommandGroup) {
        this.group = this.data.options[0].name;
        if (this.data.options[0].options[0].type === ApplicationCommandOptionType.Subcommand) {
          this.subcommand = this.data.options[0].options[0].name;
          this.options = this.data.options[0].options[0].options ?? [];
        }
      } else if (this.data.options?.[0].type === ApplicationCommandOptionType.Subcommand) {
        this.subcommand = this.data.options[0].name;
        this.options = this.data.options[0].options ?? [];
      } else this.options = (this.data.options as APIApplicationCommandInteractionDataBasicOption[]) ?? [];
    }

    if ('resolved' in data.data && data.data.resolved !== undefined) {
      if ('users' in data.data.resolved && data.data.resolved.users !== undefined) {
        const usermap = new Collection(User);
        Object.entries(data.data.resolved.users).forEach(([id, user]) => {
          usermap.set(id, this._client.users.update(user, client));
        });
        this.users = usermap;
      }

      if ('members' in data.data.resolved && data.data.resolved.members !== undefined) {
        const memberMap = new Collection(Member);
        Object.entries(data.data.resolved.members).forEach(([id, member]) => {
          // @ts-expect-error -- need ids
          member.id = id;
          // @ts-expect-error -- need ids
          member.user = { id };
          if ('guild' in this.channel) {
            // @ts-expect-error -- It has id
            memberMap.set(id, this.channel.guild.members.update(member, this.channel.guild));
          } else if ('guild_id' in data && data.guild_id) {
            const guild = this._client.guilds.get(data.guild_id)!;
            // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
            memberMap.set(id, guild.members.update(member, guild));
          }
        });
        this.members = memberMap;
      }

      if ('roles' in data.data.resolved && data.data.resolved.roles !== undefined) {
        const roleMap = new Collection(Role);
        Object.entries(data.data.resolved.roles).forEach(([id, role]) => {
          roleMap.set(id, this.guild?.roles.update(role, this.guild) ?? new Role(role, this.guild));
        });
        this.roles = roleMap;
      }

      if ('channels' in data.data.resolved && data.data.resolved.channels !== undefined) {
        const channelMap = new Collection(BaseChannel);
        Object.entries(data.data.resolved.channels).forEach(([id, channel]) => {
          channelMap.set(id, this.guild?.channels.update(channel, this._client) ?? ChannelFactory.create(channel, this._client));
        });
        this.channels = channelMap;
      }

      if ('messages' in data.data.resolved && data.data.resolved.messages !== undefined) {
        const messageMap = new Collection(Message);
        Object.entries(data.data.resolved.messages).forEach(([id, message]) => {
          messageMap.set(id, new Message(message, this._client));
        });
        this.messages = messageMap;
      }
    }

    if (data.member !== undefined) {
      // @ts-expect-error -- id
      data.member.id = data.member.user.id;
      // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
      if (this.guild) this.member = this.guild.members.update(data.member, this.guild);
      this.user = this._client.users.update(data.member.user, this._client);
    }

    if (this.user === undefined && 'user' in data && data.user !== undefined) {
      this.user = this._client.users.update(data.user, client);
    }

    // ? If at this point the user is undefined then we can try pulling it from the authorizing_integration_owners object since its likely to be a user scoped integration
    if (this.user === undefined) {
      const userID = this.authorizing_integration_owners['1'];
      if (userID !== undefined) {
        this.user = this._client.users.get(userID);
      }
    }

    this.appPermissions = new PermissionBitfield(data.app_permissions);
  }

  isSlashCommand(): this is CommandInteraction<APIChatInputApplicationCommandInteraction> {
    return this.data.type === ApplicationCommandType.ChatInput;
  }

  isUserContent(): this is CommandInteraction<APIUserApplicationCommandInteraction> {
    return this.data.type === ApplicationCommandType.User;
  }

  isMessageContent(): this is CommandInteraction<APIMessageApplicationCommandInteraction> {
    return this.data.type === ApplicationCommandType.Message;
  }

  inGuild(): this is GuildCommandInteraction {
    return this.guild !== null;
  }

  get args() {
    return this.parseArguments(this.isSlashCommand() ? (this.data as APIChatInputApplicationCommandInteractionData).options : []);
  }

  parseArguments(options: APIApplicationCommandInteractionDataOption[] = []): ArgumentType[] {
    return options.map((arg) => {
      switch (arg.type) {
        case ApplicationCommandOptionType.SubcommandGroup: {
          return {
            name: arg.name,
            type: arg.type,
            value: this.parseArguments(arg.options) as SubCommandArgument[]
          } satisfies SubCommandGroupArgument;
        }
        case ApplicationCommandOptionType.Subcommand: {
          return {
            name: arg.name,
            type: arg.type,
            value: this.parseArguments(arg.options) as Array<ChannelArgument | UserArgument | RoleArgument | MentionableArgument | BooleanArgument | NumberArgument | IntegerArgument | AttachmentArgument | StringArgument>
          } satisfies SubCommandArgument;
        }
        case ApplicationCommandOptionType.Channel: {
          return {
            name: arg.name,
            type: arg.type,
            value: this.channels.get(arg.value)!
          } satisfies ChannelArgument;
        }
        case ApplicationCommandOptionType.User: {
          return {
            name: arg.name,
            type: arg.type,
            value: this.users.get(arg.value)!
          } satisfies UserArgument;
        }
        case ApplicationCommandOptionType.Role: {
          return {
            name: arg.name,
            type: arg.type,
            value: this.roles.get(arg.value)!
          } satisfies RoleArgument;
        }
        case ApplicationCommandOptionType.Mentionable: {
          return {
            name: arg.name,
            type: arg.type,
            value: this.roles.get(arg.value) ?? this.members.get(arg.value) ?? this.users.get(arg.value) ?? arg.value
          } satisfies MentionableArgument;
        }
        case ApplicationCommandOptionType.Boolean: {
          return arg as BooleanArgument;
        }
        case ApplicationCommandOptionType.Integer: {
          return {
            ...arg,
            value: parseInt(arg.value as string, 10)
          } as IntegerArgument;
        }
        case ApplicationCommandOptionType.Number: {
          return {
            ...arg,
            value: parseFloat(arg.value as string)
          } as NumberArgument;
        }
        case ApplicationCommandOptionType.Attachment: {
          return {
            name: arg.name,
            type: arg.type,
            value: ((this.data as APIChatInputApplicationCommandInteractionData).resolved as APIInteractionDataResolved).attachments![arg.value]
          } satisfies AttachmentArgument;
        }
        default: {
          return arg satisfies StringArgument;
        }
      }
    });
  }

  getString(arg: string): string | null {
    return this.getOption<string>(arg, ApplicationCommandOptionType.String, false);
  }

  getRequiredString(arg: string): string {
    return this.getOption<string>(arg, ApplicationCommandOptionType.String, true)!;
  }

  getInteger(arg: string): number | null {
    return this.getOption<number>(arg, ApplicationCommandOptionType.Integer, false);
  }

  getRequiredInteger(arg: string): number {
    return this.getOption<number>(arg, ApplicationCommandOptionType.Integer, true)!;
  }

  getNumber(arg: string): number | null {
    return this.getOption<number>(arg, ApplicationCommandOptionType.Number, false);
  }

  getRequiredNumber(arg: string): number {
    return this.getOption<number>(arg, ApplicationCommandOptionType.Number, true)!;
  }

  getBoolean(arg: string): boolean | null {
    return this.getOption<boolean>(arg, ApplicationCommandOptionType.Boolean, false);
  }

  getRequiredBoolean(arg: string): boolean {
    return this.getOption<boolean>(arg, ApplicationCommandOptionType.Boolean, true)!;
  }

  getAttachment(arg: string): APIAttachment | null {
    const ID = this.getOption<string>(arg, ApplicationCommandOptionType.Attachment, false);
    if (!ID) return null;
    if (!('resolved' in this.data)) return null;
    return (this.data.resolved as APIInteractionDataResolved).attachments?.[ID] ?? null;
  }

  getRequiredAttachment(arg: string): APIAttachment {
    const ID = this.getOption<string>(arg, ApplicationCommandOptionType.Attachment, false);
    if (!ID) throw new TypeError(`Option ${arg} is null or undefined`);
    if (!('resolved' in this.data)) throw new TypeError(`You cannot get required attachments for PrimaryEntryPoint interactions`);
    const attachment = (this.data.resolved as APIInteractionDataResolved).attachments?.[ID];
    if (!attachment) throw new TypeError(`Option ${arg} is null or undefined`);
    return attachment;
  }

  getChannel(arg: string): BaseChannel | null {
    const value = this.getOption<string>(arg, ApplicationCommandOptionType.Channel, false);
    if (!value) return null;
    return this.channels.get(value) ?? null;
  }

  getRequiredChannel(arg: string): BaseChannel {
    const value = this.getOption<string>(arg, ApplicationCommandOptionType.Channel, true);
    if (!value) throw new TypeError(`Option ${arg} is null or undefined`);
    const object = this.channels.get(value);
    if (!object) throw new TypeError(`Option ${arg} is null or undefined`);
    return object;
  }

  getRole(arg: string): Role | null {
    const value = this.getOption<string>(arg, ApplicationCommandOptionType.Role, false);
    if (!value) return null;
    return this.roles.get(value) ?? null;
  }

  getRequiredRole(arg: string): Role {
    const value = this.getOption<string>(arg, ApplicationCommandOptionType.Role, true);
    if (!value) throw new TypeError(`Option ${arg} is null or undefined`);
    const object = this.roles.get(value);
    if (!object) throw new TypeError(`Option ${arg} is null or undefined`);
    return object;
  }

  getUser(arg: string): User | null {
    const value = this.getOption<string>(arg, ApplicationCommandOptionType.User, false);
    if (!value) return null;
    return this.users.get(value) ?? null;
  }

  getRequiredUser(arg: string): User {
    const value = this.getOption<string>(arg, ApplicationCommandOptionType.User, true);
    if (!value) throw new TypeError(`Option ${arg} is null or undefined`);
    const object = this.users.get(value);
    if (!object) throw new TypeError(`Option ${arg} is null or undefined`);
    return object;
  }

  getMember(arg: string): Member | null {
    const value = this.getOption<string>(arg, ApplicationCommandOptionType.User, false);
    if (!value) return null;
    return this.members.get(value) ?? null;
  }

  getRequiredMember(arg: string): Member {
    const value = this.getOption<string>(arg, ApplicationCommandOptionType.User, true);
    if (!value) throw new TypeError(`Option ${arg} is null or undefined`);
    const object = this.members.get(value);
    if (!object) throw new TypeError(`Option ${arg} is null or undefined`);
    return object;
  }

  getMentionable(arg: string): Member | User | null {
    const value = this.getOption<string>(arg, ApplicationCommandOptionType.Mentionable, false);
    if (!value) return null;
    return this.members.get(value) ?? this.users.get(value) ?? null;
  }

  getRequiredMentionable(arg: string): Member | User {
    const value = this.getOption<string>(arg, ApplicationCommandOptionType.Mentionable, true);
    if (!value) throw new TypeError(`Option ${arg} is null or undefined`);
    const object = this.members.get(value) ?? this.users.get(value);
    if (!object) throw new TypeError(`Option ${arg} is null or undefined`);
    return object;
  }

  private getOption<T>(arg: string, type: ApplicationCommandOptionType, required?: boolean): T | null {
    const value = this.options.find((option) => option.name === arg && option.type === type);
    if (value) return value.value as T;
    if (required) throw new TypeError(`Option ${arg} is null or undefined`);
    return null;
  }
}
