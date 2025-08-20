import pkg from '../package.json';

export * as Constants from 'discord-api-types/v10';

export { default as Client } from './Client';
export type { default as Events } from './interfaces/Events';
export { default as AutocompleteInteraction } from './structures/AutocompleteInteraction';
export { default as Base } from './structures/Base';
export { default as BaseChannel } from './structures/BaseChannel';
export { default as CategoryChannel } from './structures/CategoryChannel';
export { default as CommandInteraction, type ArgumentType, type GuildCommandInteraction } from './structures/CommandInteraction';
export { default as ComponentInteraction, type StringSelectMenuInteraction, type ChannelSelectMenuInteraction, type RoleSelectMenuInteraction, type UserSelectMenuInteraction, type MentionableSelectMenuInteraction } from './structures/ComponentInteraction';
export { default as ForumChannel } from './structures/ForumChannel';
export { default as Guild } from './structures/Guild';
export { default as GuildAuditLogEntry } from './structures/GuildAuditLogEntry';
export { default as GuildChannel } from './structures/GuildChannel';
export { default as GuildIntegration } from './structures/GuildIntegration';
export { default as GuildPreview } from './structures/GuildPreview';
export { default as GuildTemplate } from './structures/GuildTemplate';
export { default as GuildTextChannel } from './structures/GuildTextChannel';
export { default as GuildVoiceChannel } from './structures/GuildVoiceChannel';
export { default as Interaction } from './structures/Interaction';
export { default as Invite } from './structures/Invite';
export { default as MediaChannel } from './structures/MediaChannel';
export { default as Member } from './structures/Member';
export { default as Message } from './structures/Message';
export { default as ModalSubmitInteraction } from './structures/ModalSubmitInteraction';
export { default as NewsChannel } from './structures/NewsChannel';
export { default as NewsThreadChannel } from './structures/NewsThreadChannel';
export { default as PartialChannel } from './structures/PartialChannel';
export { default as PermissionOverwrite } from './structures/PermissionOverwrite';
export { default as PingInteraction } from './structures/PingInteraction';
export { default as PrivateChannel } from './structures/PrivateChannel';
export { default as Role } from './structures/Role';
export { default as StageChannel } from './structures/StageChannel';
export { default as StageInstance } from './structures/StageInstance';
export { default as ThreadChannel } from './structures/ThreadChannel';
export { default as ThreadMember } from './structures/ThreadMember';
export { default as UnavailableGuild } from './structures/UnavailableGuild';
export { default as UnknownInteraction } from './structures/UnknownInteraction';
export { default as User } from './structures/User';
export { default as VoiceState } from './structures/VoiceState';
export { default as VoiceTextChannel } from './structures/VoiceTextChannel';
export { default as Entitlement } from './structures/Entitlement';
export { default as SKU } from './structures/SKU';

export { default as Bitfield } from './util/Bitfield';
export { default as Bucket } from './util/Bucket';
export { default as ChannelFlagBitfield } from './util/ChannelFlagBitfield';
export { default as Collection } from './util/Collection';
export { default as GatewayIntentsBitfield } from './util/GatewayIntentsBitfield';
export { default as MessageFlagBitfield } from './util/MessageFlagBitfield';
export { default as MultipartData } from './util/MultipartData';
export { default as PermissionBitfield } from './util/PermissionBitfield';
export { default as SequentialBucket } from './util/SequentialBucket';
export { default as SKUFlagBitfield } from './util/SKUFlagBitfield';

export { default as Endpoints } from './rest/Endpoints';
export { default as RequestHandler, type FileType } from './rest/RequestHandler';

export { default as Shard } from './gateway/Shard';
export { default as ShardManager } from './gateway/ShardManager';

export { default as DiscordHTTPError } from './errors/DiscordHTTPError';
export { default as DiscordRESTError } from './errors/DiscordRESTError';

export { default as CommandBuilder } from './builders/CommandBuilder';
export { default as ComponentBuilder } from './builders/ComponentBuilder';
export { default as NewComponentBuilder } from './builders/NewComponentBuilder';
export { default as ModalBuilder } from './builders/ModalBuilder';

export { default as Command } from './commands/Command';
export { default as Event } from './commands/Event';
export { default as CommandClient } from './commands/CommandClient';
export { type CooldownType, type CooldownLogic, CooldownHandler } from './commands/CooldownHandler';
export { CommandError, type CommandErrorData, type CommandSnowflakeError, type CommandCooldownError, type CommandPermissionError, type CommandMiddlewareError } from './errors/CommandError';
export { SlashCommand } from './commands/Decorators';

export const VERSION = pkg.version;
