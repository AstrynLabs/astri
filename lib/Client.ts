'use strict';

import Base from './structures/Base';
import ChannelFactory from './factories/ChannelFactory';
import Collection from './util/Collection';
import Endpoints from './rest/Endpoints';
import Guild from './structures/Guild';
import GuildAuditLogEntry from './structures/GuildAuditLogEntry';
import GuildIntegration from './structures/GuildIntegration';
import GuildPreview from './structures/GuildPreview';
import GuildTemplate from './structures/GuildTemplate';
import Invite from './structures/Invite';
import Member from './structures/Member';
import Message from './structures/Message';
import PrivateChannel from './structures/PrivateChannel';
import RequestHandler, { type FileType } from './rest/RequestHandler';
import Role from './structures/Role';
import ShardManager from './gateway/ShardManager';
import ThreadMember from './structures/ThreadMember';
import UnavailableGuild from './structures/UnavailableGuild';
import User from './structures/User';
import StageInstance from './structures/StageInstance';
import EventEmitter from 'eventemitter3';
import type ShardManagerOptions from './interfaces/ShardManagerOptions';
import { AllowedMentionsTypes, GatewayIntentBits, GatewayOpcodes, PermissionFlagsBits, PresenceUpdateStatus, ActivityType, GatewayVersion, ImageFormat, Routes } from 'discord-api-types/v10';
import type {
  APIApplication,
  GatewayDispatchEvents,
  OverwriteType,
  RESTDeleteAPIChannelPermissionResult,
  RESTDeleteAPIChannelResult,
  RESTGetAPIChannelInvitesResult,
  RESTGetAPIChannelMessageReactionUsersQuery,
  RESTGetAPIChannelMessageReactionUsersResult,
  RESTGetAPIChannelMessageResult,
  RESTGetAPIChannelMessagesQuery,
  RESTGetAPIChannelMessagesResult,
  RESTGetAPIChannelPinsResult,
  RESTGetAPIChannelThreadMembersResult,
  RESTGetAPIChannelThreadsArchivedPublicResult,
  RESTGetAPIChannelThreadsArchivedQuery,
  RESTGetAPIChannelUsersThreadsArchivedResult,
  RESTGetAPIChannelWebhooksResult,
  RESTGetAPIGatewayBotResult,
  RESTGetAPIGatewayResult,
  RESTPatchAPIChannelJSONBody,
  RESTPatchAPIChannelResult,
  RESTPatchAPIGuildMemberJSONBody,
  RESTPatchAPIGuildMemberResult,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIApplicationCommandsResult,
  RESTPostAPIApplicationGuildCommandsJSONBody,
  RESTPostAPIApplicationGuildCommandsResult,
  RESTPostAPIChannelFollowersResult,
  RESTPostAPIChannelInviteJSONBody,
  RESTPostAPIChannelInviteResult,
  RESTPostAPIChannelMessageCrosspostResult,
  RESTPostAPIChannelMessagesThreadsJSONBody,
  RESTPostAPIChannelMessagesThreadsResult,
  RESTPostAPIChannelThreadsJSONBody,
  RESTPostAPIChannelThreadsResult,
  RESTPostAPIChannelWebhookJSONBody,
  RESTPostAPIChannelWebhookResult,
  RESTPostAPIGuildChannelJSONBody,
  RESTPostAPIGuildChannelResult,
  RESTPostAPIGuildEmojiJSONBody,
  RESTPostAPIGuildEmojiResult,
  RESTPostAPIGuildStickerFormDataBody,
  RESTPostAPIGuildStickerResult,
  RESTPostAPIGuildsJSONBody,
  RESTPostAPIGuildsResult,
  RESTPostAPIInteractionCallbackJSONBody,
  RESTPostAPITemplateCreateGuildResult,
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationCommandsResult,
  RESTPutAPIApplicationGuildCommandsJSONBody,
  RESTPutAPIApplicationGuildCommandsResult,
  RESTPostAPIStageInstanceJSONBody,
  RESTPostAPIStageInstanceResult,
  RESTPatchAPIStageInstanceJSONBody,
  RESTPatchAPIStageInstanceResult,
  RESTGetAPIStageInstanceResult,
  RESTPutAPIGuildApplicationCommandsPermissionsJSONBody,
  RESTPutAPIGuildApplicationCommandsPermissionsResult,
  RESTPostAPIGuildRoleJSONBody,
  RESTPostAPIGuildRoleResult,
  RESTDeleteAPIGuildTemplateResult,
  RESTPatchAPIGuildJSONBody,
  RESTPatchAPIGuildResult,
  RESTPatchAPIGuildChannelPositionsJSONBody,
  RESTPatchAPIApplicationGuildCommandJSONBody,
  RESTPatchAPIApplicationGuildCommandResult,
  RESTPatchAPIGuildEmojiJSONBody,
  RESTPatchAPIGuildEmojiResult,
  RESTPatchAPIGuildRoleJSONBody,
  RESTPatchAPIGuildRoleResult,
  RESTPatchAPIGuildStickerJSONBody,
  RESTPatchAPIGuildStickerResult,
  RESTPatchAPIGuildTemplateJSONBody,
  RESTPatchAPIGuildTemplateResult,
  RESTPatchAPIGuildVoiceStateUserJSONBody,
  RESTPatchAPIGuildWelcomeScreenJSONBody,
  RESTPatchAPIGuildWidgetSettingsJSONBody,
  RESTGetAPIAuditLogQuery,
  RESTGetAPIAuditLogResult,
  RESTGetAPIGuildBanResult,
  RESTGetAPIGuildBansResult,
  RESTGetAPIGuildBansQuery,
  RESTGetAPIApplicationGuildCommandResult,
  RESTGetAPIApplicationCommandPermissionsResult,
  RESTGetAPIApplicationGuildCommandsResult,
  RESTGetAPIGuildIntegrationsResult,
  RESTGetAPIGuildInvitesResult,
  RESTGetAPIGuildPreviewResult,
  RESTGetAPIGuildTemplatesResult,
  RESTGetAPITemplateResult,
  RESTGetAPIGuildVanityUrlResult,
  RESTGetAPIGuildWelcomeScreenResult,
  RESTGetAPIGuildWidgetJSONResult,
  RESTGetAPIInviteResult,
  RESTGetAPIGuildPruneCountResult,
  RESTGetAPIGuildPruneCountQuery,
  RESTGetAPIGuildChannelsResult,
  RESTGetAPIGuildEmojiResult,
  RESTGetAPIGuildEmojisResult,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildMembersQuery,
  RESTGetAPIGuildRolesResult,
  RESTGetAPIStickerResult,
  RESTGetAPIGuildStickersResult,
  RESTGetAPIGuildStickerResult,
  RESTPostAPIGuildPruneJSONBody,
  RESTPostAPIGuildPruneResult,
  RESTGetAPIGuildMembersSearchResult,
  RESTPutAPIGuildTemplateSyncResult,
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildWebhooksResult,
  RESTGetAPIGuildWidgetSettingsResult,
  RESTPatchAPIGuildWelcomeScreenResult,
  RESTPatchAPIGuildWidgetSettingsResult,
  RESTPostAPIChannelMessageJSONBody,
  APIEmbed,
  APIAllowedMentions,
  RESTPostAPIChannelMessageResult,
  RESTPatchAPIApplicationCommandJSONBody,
  RESTPatchAPIApplicationCommandResult,
  RESTPatchAPIChannelMessageJSONBody,
  RESTPatchAPIChannelMessageResult,
  RESTPatchAPICurrentUserJSONBody,
  RESTPatchAPICurrentUserResult,
  RESTPatchAPIWebhookJSONBody,
  RESTPatchAPIWebhookWithTokenMessageJSONBody,
  RESTPatchAPIWebhookWithTokenMessageResult,
  RESTPostAPIWebhookWithTokenJSONBody,
  RESTPostAPIWebhookWithTokenResult,
  RESTGetAPIGuildThreadsResult,
  RESTGetAPIApplicationCommandResult,
  RESTGetAPIApplicationCommandsResult,
  RESTPostAPICurrentUserCreateDMChannelResult,
  APIDMChannel,
  RESTGetAPIOAuth2CurrentApplicationResult,
  RESTGetAPIChannelResult,
  RESTGetAPIGuildResult,
  RESTGetAPICurrentUserGuildsQuery,
  RESTGetAPICurrentUserGuildsResult,
  RESTGetAPIUserResult,
  RESTGetAPIVoiceRegionsResult,
  RESTGetAPIWebhookResult,
  RESTGetAPIWebhookWithTokenMessageResult,
  GatewayActivity,
  RESTPostAPIGuildTemplatesResult,
  RESTGetAPISKUsResult,
  RESTGetAPIEntitlementsResult,
  RESTPostAPIGuildForumThreadsJSONBody,
  RESTGetAPIApplicationEmojisResult,
  RESTPostAPIApplicationEmojiJSONBody,
  RESTPostAPIApplicationEmojiResult,
  RESTPatchAPIApplicationEmojiJSONBody,
  RESTPatchAPIApplicationEmojiResult,
  RESTGetAPIApplicationEmojiResult
} from 'discord-api-types/v10';
import GatewayIntentBitfield from './util/GatewayIntentsBitfield';
import type { ChannelTypes } from './interfaces/Types';
import type * as WebSocket from 'ws';
import type Events from './interfaces/Events';
import SKU from './structures/SKU';
import Entitlement from './structures/Entitlement';
import ZlibHelper from './util/Zlib';

const sleep = async (ms: number): Promise<NodeJS.Timeout> => new Promise((res) => setTimeout(res, ms));

/**
 * Represents the main astri-ts client
 * @extends EventEmitter
 * @prop {Object?} application Object containing the bot application's ID and its public flags
 * @prop {Boolean} bot Whether the bot user belongs to an OAuth2 application
 * @prop {Object} channelGuildMap Object mapping channel IDs to guild IDs
 * @prop {string} gatewayURL The URL for the discord gateway
 * @prop {Collection<GroupChannel>} groupChannels Collection of group channels the bot is in (user accounts only)
 * @prop {Collection<Guild>} guilds Collection of guilds the bot is in
 * @prop {Object} guildShardMap Object mapping guild IDs to shard IDs
 * @prop {Object} notes Object mapping user IDs to user notes (user accounts only)
 * @prop {Object} options astri-ts options
 * @prop {Object} privateChannelMap Object mapping user IDs to private channel IDs
 * @prop {Collection<PrivateChannel>} privateChannels Collection of private channels the bot is in
 * @prop {Collection<Relationship>} relationships Collection of relationships the bot user has (user accounts only)
 * @prop {RequestHandler} requestHandler The request handler the client will use
 * @prop {Collection<Shard>} shards Collection of shards astri-ts is using
 * @prop {number} startTime Timestamp of bot ready event
 * @prop {Object} threadGuildMap Object mapping thread channel IDs to guild IDs
 * @prop {Collection<UnavailableGuild>} unavailableGuilds Collection of unavailable guilds the bot is in
 * @prop {number} uptime How long in milliseconds the bot has been up for
 * @prop {ExtendedUser} user The bot user
 * @prop {Object} userGuildSettings Object mapping guild IDs to individual guild settings for the bot user (user accounts only)
 * @prop {Collection<User>} users Collection of users the bot sees
 * @prop {Object} userSettings Object containing the user account settings (user accounts only)
 * @prop {Collection<VoiceConnection>} voiceConnections Extended collection of active VoiceConnections the bot has
 */
export default class Client extends EventEmitter<Events> {
  _token = '';
  application?: Pick<APIApplication, 'id' | 'flags'>;
  options: ClientOptions;
  requestHandler: RequestHandler;
  shards: ShardManager;
  ready = false;
  bot: boolean;
  startTime = 0;
  lastConnect = 0;
  channelGuildMap: Record<string, string> = {};
  threadGuildMap: Record<string, string> = {};
  guilds = new Collection(Guild);
  privateChannelMap: Record<string, string> = {};
  privateChannels = new Collection(PrivateChannel);
  guildShardMap: Record<string, number> = {};
  unavailableGuilds = new Collection(UnavailableGuild);
  users = new Collection(User);
  presence: {
    activities: Array<Omit<GatewayActivity, 'id' | 'created_at'>>;
    afk: boolean;
    since: number | null;
    status: PresenceUpdateStatus;
  } = {
    activities: [],
    afk: false,
    since: null,
    status: PresenceUpdateStatus.Offline
  };
  userGuildSettings = [];
  userSettings = {};
  notes = {};
  lastReconnectDelay = 0;
  reconnectAttempts = 0;
  gatewayURL?: string;
  user: User;
  intents: GatewayIntentBitfield;
  SKUs = new Collection(SKU);
  constructor(token: string, options?: ClientOptions) {
    super();

    this.options = Object.assign(
      {
        allowedMentions: {
          users: false,
          roles: false,
          everyone: false,
          repliedUser: true
        },
        autoreconnect: true,
        compress: true,
        connectionTimeout: 30000,
        defaultImageFormat: ImageFormat.JPEG,
        defaultImageSize: 128,
        disableEvents: {},
        getAllUsers: false,
        guildCreateTimeout: 2000,
        intents: 3243773,
        largeThreshold: 250,
        maxReconnectAttempts: Infinity,
        maxResumeAttempts: 10,
        maxShards: 1,
        messageLimit: 100,
        opusOnly: false,
        requestTimeout: 15000,
        rest: {},
        restMode: false,
        seedVoiceConnections: false,
        shardConcurrency: 'auto',
        ws: {},
        reconnectDelay: (lastDelay: number, attempts: number) => Math.pow(attempts + 1, 0.7) * 20000
      },
      options
    );
    this.options.allowedMentions = this._formatAllowedMentions(this.options.allowedMentions);
    if (this.options.shards === undefined && this.options.lastShardID === undefined && this.options.maxShards !== 'auto') {
      this.options.lastShardID = Number(this.options.maxShards) - 1;
    }
    if (this.options.defaultImageFormat && !Object.values(ImageFormat).includes(this.options.defaultImageFormat)) {
      throw new TypeError(`Invalid default image format: ${this.options.defaultImageFormat}`);
    }
    const defaultImageSize = this.options.defaultImageSize ?? 16;
    if (defaultImageSize < 16 || defaultImageSize > 4096 || defaultImageSize & (defaultImageSize - 1)) {
      throw new TypeError(`Invalid default image size: ${defaultImageSize}`);
    }
    // Set HTTP Agent on Websockets if not already set
    if (this.options.rest?.agent && !this.options?.ws?.agent) {
      this.options.ws ??= {};
      this.options.ws.agent = this.options.rest.agent;
    }

    if (this.options.intents) {
      // Resolve intents option to the proper integer
      if (Array.isArray(this.options.intents)) {
        let bitmask = 0;
        for (const intent of this.options.intents) {
          if (typeof intent === 'number') {
            bitmask |= intent;
          } else if (GatewayIntentBits[intent]) {
            bitmask |= GatewayIntentBits[intent];
          } else {
            this.emit('warn', `Unknown intent: ${intent}`);
          }
        }
        this.options.intents = bitmask;
        this.intents = new GatewayIntentBitfield(bitmask);
      } else this.intents = new GatewayIntentBitfield(this.options.intents);

      // Ensure requesting all guild members isn't destined to fail
      if (this.options.getAllUsers && !this.intents.has(GatewayIntentBits.GuildMembers)) {
        throw new Error('Cannot request all members without guildMembers intent');
      }
    } else this.intents = new GatewayIntentBitfield();

    Object.defineProperty(this, '_token', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: token
    });

    this.requestHandler = new RequestHandler(this, this.options.rest!);
    delete this.options.rest;

    const shardManagerOptions: ShardManagerOptions = { concurrency: 1 };
    if (typeof this.options.shardConcurrency === 'number') {
      shardManagerOptions.concurrency = this.options.shardConcurrency;
    }
    this.shards = new ShardManager(this, shardManagerOptions);
    this.bot = this._token.startsWith('Bot ');

    this.connect = this.connect.bind(this);
  }

  get uptime() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  /**
   * Add a role to a guild member
   * @param {string} guildID The ID of the guild
   * @param {string} memberID The ID of the member
   * @param {string} roleID The ID of the role
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  addGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string) {
    return this.requestHandler.request('PUT', Endpoints.GUILD_MEMBER_ROLE(guildID, memberID, roleID), true, {
      reason
    });
  }

  /**
   * Add a reaction to a message
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message
   * @param {string} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @returns {Promise}
   */
  addMessageReaction(channelID: string, messageID: string, reaction: string) {
    if (reaction === decodeURI(reaction)) {
      reaction = encodeURIComponent(reaction);
    }
    return this.requestHandler.request('PUT', Endpoints.CHANNEL_MESSAGE_REACTION_USER(channelID, messageID, reaction, '@me'), true);
  }

  /**
   * Ban a user from a guild
   * @param {string} guildID The ID of the guild
   * @param {string} userID The ID of the user
   * @param {number} [deleteMessageDays=0] Number of days to delete messages for, between 0-7 inclusive
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  banGuildMember(guildID: string, userID: string, deleteMessageDays = 0, reason?: string) {
    if (!isNaN(deleteMessageDays) && (deleteMessageDays < 0 || deleteMessageDays > 7)) {
      return Promise.reject(new Error(`Invalid deleteMessageDays value (${deleteMessageDays}), should be a number between 0-7 inclusive`));
    }
    return this.requestHandler.request('PUT', Endpoints.GUILD_BAN(guildID, userID), true, {
      delete_message_days: deleteMessageDays || 0,
      reason
    });
  }

  /**
   * Edits command permissions for a multiple commands in a guild.
   * Note: You can only add up to 10 permission overwrites for a command.
   * @arg {String} guildID The guild ID
   * @arg {Array<Object>} permissions An array of [partial guild command permissions](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure)
   * @returns {Promise<Array<Object>>} Returns an array of [GuildApplicationCommandPermissions](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure) objects.
   */
  bulkEditCommandPermissions(guildID: string, permissions: RESTPutAPIGuildApplicationCommandsPermissionsJSONBody) {
    if (!guildID) {
      throw new Error('You must provide an id of the guild whose permissions you want to edit.');
    }

    return this.requestHandler.request<RESTPutAPIGuildApplicationCommandsPermissionsResult>('PUT', Endpoints.GUILD_COMMAND_PERMISSIONS(this.application!.id, guildID), true, permissions);
  }

  /**
   * Bulk create/edit global application commands
   * @param {APIApplicationCommand[]} commands An array of [Command objects](https://discord.com/developers/docs/interactions/application-commands#application-command-object)
   * @returns {Promise<Array>} Resolves with an array of commands objects
   */
  bulkEditCommands(commands: RESTPutAPIApplicationCommandsJSONBody) {
    for (const command of commands) {
      if (command.name !== undefined) {
        if (command.type === 1 || command.type === undefined) {
          command.name = command.name.toLowerCase();
          if (!command.name.match(/^[\w-]{1,32}$/)) {
            throw new Error('Slash Command names must match the regular expression "^[\\w-]{1,32}$"');
          }
        }
      }
    }
    return this.requestHandler.request<RESTPutAPIApplicationCommandsResult>('PUT', Endpoints.COMMANDS(this.application!.id), true, commands);
  }

  /**
   * Bulk create/edit guild application commands
   * @param {string} guildID Guild id to create the commands in
   * @param {Array<Object>} commands An array of [Command objects](https://discord.com/developers/docs/interactions/application-commands#application-command-object)
   * @returns {Promise<Object>} Resolves with an array of commands objects
   */
  bulkEditGuildCommands(guildID: string, commands: RESTPutAPIApplicationGuildCommandsJSONBody) {
    for (const command of commands) {
      if (command.name !== undefined) {
        if (command.type === 1 || command.type === undefined) {
          command.name = command.name.toLowerCase();
          if (!command.name.match(/^[\w-]{1,32}$/)) {
            throw new Error('Slash Command names must match the regular expression "^[\\w-]{1,32}$"');
          }
        }
      }
    }
    return this.requestHandler.request<RESTPutAPIApplicationGuildCommandsResult>('PUT', Endpoints.GUILD_COMMANDS(this.application!.id, guildID), true, commands);
  }

  /**
   * Closes a voice connection with a guild ID
   * @param {string} guildID The ID of the guild
   */
  closeVoiceConnection(guildID: string) {
    this.shards.get(this.guildShardMap[guildID] || 0)!.sendWS(GatewayOpcodes.VoiceStateUpdate, {
      guild_id: guildID || null,
      channel_id: null,
      self_mute: false,
      self_deaf: false
    });
  }

  /**
   * Tells all shards to connect. This will call `getBotGateway()`, which is ratelimited.
   * @returns {Promise} Resolves when all shards are initialized
   */
  async connect(): Promise<void> {
    if (typeof this._token !== 'string') {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid token "${this._token}"`);
    }
    try {
      let url: string;
      // if (this.options.maxShards === 'auto' || (this.options.shardConcurrency === 'auto' && this.bot)) {
      const gateway = await this.getBotGateway();
      url = gateway.url;

      if (this.options.maxShards === 'auto') {
        if (!gateway.shards) {
          throw new Error('Failed to auto shard due to lack of data from Discord.');
        }
        this.options.maxShards = gateway.shards;
        this.options.firstShardID = 0;
        if (this.options.lastShardID === undefined) {
          this.options.lastShardID = gateway.shards - 1;
        }
      }

      if (this.options.shardConcurrency === 'auto' && gateway.session_start_limit && typeof gateway.session_start_limit.max_concurrency === 'number') {
        this.shards.setConcurrency(gateway.session_start_limit.max_concurrency);
      }

      if (url.includes('?')) {
        url = url.substring(0, url.indexOf('?'));
      }
      if (!url.endsWith('/')) {
        url += '/';
      }
      this.gatewayURL = `${url}?v=${GatewayVersion}`;
      const helper = new ZlibHelper();
      this.emit('debug', 'Checking if we can use zlib compression');
      if (this.options.compress && (await helper.init())) {
        this.gatewayURL += '&compress=zlib-stream';
        this.emit('debug', 'zlib-sync found, compression enabled');
      } else {
        this.options.compress = false;
        this.emit('debug', 'zlib-sync not found, compression disabled');
      }

      if (this.options.shards) {
        if (this.options.firstShardID !== undefined || this.options.lastShardID !== undefined) this.emit('warn', 'shards was specified in options which overrides firstShardID and lastShardID');
        for (const ID of this.options.shards) {
          this.shards.spawn(ID);
        }
      } else {
        for (let i = this.options.firstShardID ?? 0; i <= (this.options.lastShardID ?? 0); ++i) {
          this.shards.spawn(i);
        }
      }
    } catch (err) {
      if (!this.options.autoreconnect) {
        throw err;
      }
      this.emit('error', err as Error);
      const reconnectDelay = this.options.reconnectDelay!(this.lastReconnectDelay, this.reconnectAttempts);
      await sleep(reconnectDelay);
      this.lastReconnectDelay = reconnectDelay;
      this.reconnectAttempts = this.reconnectAttempts + 1;
      return await this.connect();
    }
  }

  /**
   * Create a channel in a guild
   * @param {string} guildID The ID of the guild to create the channel in
   * @param {Object | string} [options] The properties the channel should have. If `options` is a string, it will be treated as `options.parentID` (see below). Passing a string is deprecated and will not be supported in future versions.
   * @param {number} [options.bitrate] The bitrate of the channel (voice channels only)
   * @param {Boolean} [options.nsfw] The nsfw status of the channel
   * @param {string?} [options.parentID] The ID of the parent category channel for this channel
   * @param {Array<Object>} [options.permissionOverwrites] An array containing permission overwrite objects
   * @param {number} [options.position] The sorting position of the channel
   * @param {number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (does not affect bots or users with manageMessages/manageChannel permissions) (text channels only)
   * @param {string} [options.reason] The reason to be displayed in audit logs
   * @param {string} [options.topic] The topic of the channel (text channels only)
   * @param {number} [options.userLimit] The channel user limit (voice channels only)
   * @returns {Promise<CategoryChannel | TextChannel | TextVoiceChannel>}
   */
  createChannel(guildID: string, options: RESTPostAPIGuildChannelJSONBody, reason?: string) {
    return this.requestHandler
      .request<RESTPostAPIGuildChannelResult>('POST', Endpoints.GUILD_CHANNELS(guildID), true, {
        ...options,
        reason
      })
      .then((channel) => ChannelFactory.create(channel, this));
  }

  /**
   * Create an invite for a channel
   * @param {string} channelID The ID of the channel
   * @param {Object} [options] Invite generation options
   * @param {number} [options.maxAge] How long the invite should last in seconds
   * @param {number} [options.maxUses] How many uses the invite should last for
   * @param {string} [options.targetApplicationID] The target application id
   * @param {number} [options.targetType] The type of the target application
   * @param {string} [options.targetUserID] The ID of the user whose stream should be displayed for the invite (`options.targetType` must be `1`)
   * @param {Boolean} [options.temporary] Whether the invite grants temporary membership or not
   * @param {Boolean} [options.unique] Whether the invite is unique or not
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Invite>}
   */
  createChannelInvite(channelID: string, options: RESTPostAPIChannelInviteJSONBody = {}, reason?: string) {
    return this.requestHandler
      .request<RESTPostAPIChannelInviteResult>('POST', Endpoints.CHANNEL_INVITES(channelID), true, {
        ...options,
        reason
      })
      .then((invite) => new Invite(invite, this));
  }

  /**
   * Create a channel webhook
   * @param {string} channelID The ID of the channel to create the webhook in
   * @param {Object} options Webhook options
   * @param {string} options.name The default name
   * @param {string} [options.avatar] The default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @returns {Promise<Object>} Resolves with a webhook object
   */
  createChannelWebhook(channelID: string, options: RESTPostAPIChannelWebhookJSONBody) {
    return this.requestHandler.request<RESTPostAPIChannelWebhookResult>('POST', Endpoints.CHANNEL_WEBHOOKS(channelID), true, options);
  }

  /**
   * Create a global application command
   * @param {APIApplicationCommand} command A command object
   * @returns {Promise<Object>} Resolves with a commands object
   */
  createCommand(command: RESTPostAPIApplicationCommandsJSONBody) {
    if (command.name !== undefined) {
      if (command.type === 1 || command.type === undefined) {
        command.name = command.name.toLowerCase();
        if (!command.name.match(/^[\w-]{1,32}$/)) {
          throw new Error('Slash Command names must match the regular expression "^[\\w-]{1,32}$"');
        }
      }
    }
    return this.requestHandler.request<RESTPostAPIApplicationCommandsResult>('POST', Endpoints.COMMANDS(this.application!.id), true, command);
  }

  /**
   * Create a guild
   * @param {string} name The name of the guild
   * @param {Object} options The properties of the guild
   * @param {string} [options.afkChannelID] The ID of the AFK voice channel
   * @param {number} [options.afkTimeout] The AFK timeout in seconds
   * @param {Array<Object>} [options.channels] The new channels of the guild. IDs are placeholders which allow use of category channels.
   * @param {number} [options.defaultNotifications] The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions".
   * @param {number} [options.explicitContentFilter] The level of the explicit content filter for messages/images in the guild. 0 disables message scanning, 1 enables scanning the messages of members without roles, 2 enables scanning for all messages.
   * @param {string} [options.icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @param {Array<Object>} [options.roles] The new roles of the guild, the first one is the @everyone role. IDs are placeholders which allow channel overwrites.
   * @param {string} [options.systemChannelID] The ID of the system channel
   * @param {number} [options.verificationLevel] The guild verification level
   * @returns {Promise<Guild>}
   */
  createGuild(options: RESTPostAPIGuildsJSONBody) {
    if (this.guilds.size > 9) {
      throw new Error("This method can't be used when in 10 or more guilds.");
    }

    return this.requestHandler.request<RESTPostAPIGuildsResult>('POST', Endpoints.GUILDS, true, options).then((guild) => new Guild(guild, this));
  }

  /**
   * Create a guild application command
   * @param {string} guildID The ID of the guild to create the command in
   * @param {Object} command A command object
   * @param {string} command.name The command name
   * @param {string} [command.description] The command description (Slash Commands Only)
   * @param {Array<Object>} [command.options] An array of [command options](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)
   * @param {number} [type=1] The type of application command, 1 for slash command, 2 for user, and 3 for message
   * @param {Boolean} [command.defaultPermission] Whether the command is enabled by default when the app is added to a guild
   * @returns {Promise<Object>} Resolves with a commands object
   */
  createGuildCommand(guildID: string, command: RESTPostAPIApplicationGuildCommandsJSONBody) {
    if (command.name !== undefined) {
      if (command.type === 1 || command.type === undefined) {
        command.name = command.name.toLowerCase();
        if (!command.name.match(/^[\w-]{1,32}$/)) {
          throw new Error('Slash Command names must match the regular expression "^[\\w-]{1,32}$"');
        }
      }
    }
    return this.requestHandler.request<RESTPostAPIApplicationGuildCommandsResult>('POST', Endpoints.GUILD_COMMANDS(this.application!.id, guildID), true, command);
  }

  /**
   * Create a guild emoji object
   * @param {string} guildID The ID of the guild to create the emoji in
   * @param {Object} options Emoji options
   * @param {string} options.image The base 64 encoded string
   * @param {string} options.name The name of emoji
   * @param {Array} [options.roles] An array containing authorized role IDs
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} A guild emoji object
   */
  createGuildEmoji(guildID: string, options: RESTPostAPIGuildEmojiJSONBody, reason?: string) {
    return this.requestHandler.request<RESTPostAPIGuildEmojiResult>('POST', Endpoints.GUILD_EMOJIS(guildID), true, { ...options, reason });
  }

  /**
   * Create a guild based on a template. This can only be used with bots in less than 10 guilds
   * @param {string} code The template code
   * @param {string} name The name of the guild
   * @param {string} [icon] The 128x128 icon as a base64 data URI
   * @returns {Promise<Guild>}
   */
  createGuildFromTemplate(code: string, name: string, icon?: string) {
    return this.requestHandler
      .request<RESTPostAPITemplateCreateGuildResult>('POST', Endpoints.GUILD_TEMPLATE(code), true, {
        name,
        icon
      })
      .then((guild) => new Guild(guild, this));
  }

  /**
   * Create a guild sticker
   * @param {Object} options Sticker options
   * @param {string} [options.description] The description of the sticker
   * @param {Object} options.file A file object
   * @param {Buffer} options.file.file A buffer containing file data
   * @param {string} options.file.name What to name the file
   * @param {string} options.name The name of the sticker
   * @param {string} options.tags The Discord name of a unicode emoji representing the sticker's expression
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} A sticker object
   */
  createGuildSticker(guildID: string, options: RESTPostAPIGuildStickerFormDataBody, reason?: string) {
    return this.requestHandler.request<RESTPostAPIGuildStickerResult>(
      'POST',
      Endpoints.GUILD_STICKERS(guildID),
      true,
      {
        ...options,
        reason
      },
      options.file as FileType
    );
  }

  /**
   * Create a template for a guild
   * @param {string} guildID The ID of the guild
   * @param {string} name The name of the template
   * @param {string} [description] The description for the template
   * @returns {Promise<GuildTemplate>}
   */
  createGuildTemplate(guildID: string, name: string, description?: string) {
    return this.requestHandler
      .request<RESTPostAPIGuildTemplatesResult>('POST', Endpoints.GUILD_TEMPLATES(guildID), true, {
        name,
        description
      })
      .then((template) => new GuildTemplate(template, this));
  }

  /**
   * Respond to the interaction with a message
   * Note: Use webhooks if you have already responded with an interaction response.
   * @param {string} interactionID The interaction ID.
   * @param {string} interactionToken The interaction Token.
   * @param {Object} options The options object.
   * @param {Object} [options.data] The data to send with the response.
   * @param {Object} [options.data.allowedMentions] A list of mentions to allow (overrides default)
   * @param {Boolean} [options.data.allowedMentions.everyone] Whether or not to allow @everyone/@here.
   * @param {Boolean} [options.data.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to.
   * @param {Boolean | Array<string>} [options.data.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
   * @param {Boolean | Array<string>} [options.data.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
   * @param {Array<Object>} [options.data.components] An array of components. See [the official Discord API documentation entry](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
   * @param {string} [options.data.content] A content string
   * @param {Object} [options.data.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @param {Array<Object>} [options.data.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @param {Boolean} [options.data.flags] 64 for Ephemeral (applies to Application Commands and Message Components)
   * @param {Boolean} [options.data.tts] Set the message TTS flag
   * @param {number} options.type The response type to send. See [the official Discord API documentation entry](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type) for valid types
   * @param {Object | Array<Object>} [file] A file object (or an Array of them)
   * @param {Buffer} file.file A buffer containing file data
   * @param {string} file.name What to name the file
   * @returns {Promise}
   */
  createInteractionResponse(interactionID: string, interactionToken: string, options: RESTPostAPIInteractionCallbackJSONBody, file?: FileType) {
    return this.requestHandler.request('POST', Endpoints.INTERACTION_RESPOND(interactionID, interactionToken), true, options, file, '/interactions/:id/:token/callback');
  }

  /**
   * Create a message in a channel
   * Note: If you want to DM someone, the user ID is **not** the DM channel ID. use Client.getDMChannel() to get the DM channel for a user
   * @param {string} channelID The ID of the channel
   * @param {string | Object} content A string or object. If an object is passed:
   * @param {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
   * @param {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @param {Boolean | Array<string>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @param {Boolean | Array<string>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @param {Boolean} [content.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
   * @param {Array<Object>} [content.components] An array of components. See [the official Discord API documentation entry](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
   * @param {string} [content.content] A content string
   * @param {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @param {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @param {Object} [content.messageReference] The message reference, used when replying to messages
   * @param {string} [content.messageReference.channelID] The channel ID of the referenced message
   * @param {Boolean} [content.messageReference.failIfNotExists=true] Whether to throw an error if the message reference doesn't exist. If false, and the referenced message doesn't exist, the message is created without a referenced message
   * @param {string} [content.messageReference.guildID] The guild ID of the referenced message
   * @param {string} content.messageReference.messageID The message ID of the referenced message. This cannot reference a system message
   * @param {string} [content.messageReferenceID] [DEPRECATED] The ID of the message should be replied to. Use `messageReference` instead
   * @param {Array<string>} [content.stickerIDs] An array of IDs corresponding to stickers to send
   * @param {Boolean} [content.tts] Set the message TTS flag
   * @param {Object | Array<Object>} [file] A file object (or an Array of them)
   * @param {Buffer} file.file A buffer containing file data
   * @param {string} file.name What to name the file
   * @returns {Promise<Message>}
   */
  createMessage(channelID: string, content: (RESTPostAPIChannelMessageJSONBody & { embed?: APIEmbed }) | string, file?: FileType) {
    if (content !== undefined) {
      if (typeof content !== 'object' || content === null) {
        content = {
          content: '' + content
        };
      } else if (content.content !== undefined && typeof content.content !== 'string') {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        content.content = `${content.content}`;
      } else if (content.embed) {
        if (!content.embeds) {
          content.embeds = [];
        }
        content.embeds.push(content.embed);
      }
      if (typeof content === 'object') {
        content.allowed_mentions = this._formatAllowedMentions(content.allowed_mentions);
      }
    }
    return this.requestHandler.request<RESTPostAPIChannelMessageResult>('POST', Endpoints.CHANNEL_MESSAGES(channelID), true, content, file).then((message) => new Message(message, this));
  }

  /**
   * Create a guild role
   * @param {string} guildID The ID of the guild to create the role in
   * @param {Object | Role} [options] An object or Role containing the properties to set
   * @param {number} [options.color] The hex color of the role, in number form (ex: 0x3d15b3 or 4040115)
   * @param {Boolean} [options.hoist] Whether to hoist the role in the user list or not
   * @param {string} [options.icon] The role icon as a base64 data URI
   * @param {Boolean} [options.mentionable] Whether the role is mentionable or not
   * @param {string} [options.name] The name of the role
   * @param {BigInt | Number | string | Permission} [options.permissions] The role permissions
   * @param {string} [options.unicodeEmoji] The role's unicode emoji
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Role>}
   */
  createRole(guildID: string, options?: RESTPostAPIGuildRoleJSONBody, reason?: string) {
    return this.requestHandler
      .request<RESTPostAPIGuildRoleResult>('POST', Endpoints.GUILD_ROLES(guildID), true, {
        ...options,
        reason
      })
      .then((role) => {
        const guild = this.guilds.get(guildID);
        if (!guild) throw new Error('Role created for uncached guild');
        return guild.roles.add(role, guild);
      });
  }

  /**
   * Create a stage instance
   * @param {string} channelID The ID of the stage channel to create the instance in
   * @param {Object} options The stage instance options
   * @param {number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
   * @param {string} options.topic The stage instance topic
   * @returns {Promise<StageInstance>}
   */
  createStageInstance(channelID: string, options: Omit<RESTPostAPIStageInstanceJSONBody, 'channel_id'>) {
    return this.requestHandler
      .request<RESTPostAPIStageInstanceResult>('POST', Endpoints.STAGE_INSTANCES, true, {
        ...options,
        channel_id: channelID
      })
      .then((instance) => new StageInstance(instance, this));
  }

  /**
   * Create a thread with an existing message
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message to create the thread from
   * @param {Object} options The thread options
   * @param {number} options.autoArchiveDuration Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
   * @param {string} options.name The thread channel name
   * @returns {Promise<NewsThreadChannel | PublicThreadChannel>}
   */
  createThreadWithMessage(channelID: string, messageID: string, options: RESTPostAPIChannelMessagesThreadsJSONBody): Promise<ChannelTypes> {
    return this.requestHandler.request<RESTPostAPIChannelMessagesThreadsResult>('POST', Endpoints.THREAD_WITH_MESSAGE(channelID, messageID), true, options).then((channel) => ChannelFactory.create(channel, this));
  }

  /**
   * Create a thread without an existing message
   * @param {string} channelID The ID of the channel
   * @param {Object} options The thread options
   * @param {number} options.autoArchiveDuration Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
   * @param {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the thread (private threads only)
   * @param {string} options.name The thread channel name
   * @param {number} [options.type] The channel type of the thread to create. It is recommended to explicitly set this property as this will be a required property in API v10
   * @returns {Promise<PrivateThreadChannel>}
   */
  createThreadWithoutMessage(channelID: string, options: RESTPostAPIChannelThreadsJSONBody): Promise<ChannelTypes> {
    return this.requestHandler.request<RESTPostAPIChannelThreadsResult>('POST', Endpoints.THREAD_WITHOUT_MESSAGE(channelID), true, options).then((channel) => ChannelFactory.create(channel, this));
  }

  /**
   * Create a thread in a thread only channel (ForumChannel, MediaChannel)
   * @param {string} channelID The ID of the channel
   * @param {Object} options The thread options
   * @param {number} options.autoArchiveDuration Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
   * @param {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the thread (private threads only)
   * @param {string} options.name The thread channel name
   * @param {number} [options.type] The channel type of the thread to create. It is recommended to explicitly set this property as this will be a required property in API v10
   * @param {RESTPostAPIChannelMessageJSONBody} [options.message] The message to create in the thread
   * @returns {Promise<PrivateThreadChannel>}
   */
  createThreadInThreadOnlyChannel(channelID: string, options: RESTPostAPIGuildForumThreadsJSONBody): Promise<ChannelTypes> {
    return this.requestHandler.request<RESTPostAPIChannelMessagesThreadsResult>('POST', Endpoints.THREAD_WITHOUT_MESSAGE(channelID), true, options).then((channel) => ChannelFactory.create(channel, this));
  }

  /**
   * Crosspost (publish) a message to subscribed channels
   * @param {string} channelID The ID of the NewsChannel
   * @param {string} messageID The ID of the message
   * @returns {Promise<Message>}
   */
  crosspostMessage(channelID: string, messageID: string) {
    return this.requestHandler.request<RESTPostAPIChannelMessageCrosspostResult>('POST', Endpoints.CHANNEL_CROSSPOST(channelID, messageID), true).then((message) => new Message(message, this));
  }

  /**
   * Delete a guild channel, or leave a private or group channel
   * @param {string} channelID The ID of the channel
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteChannel(channelID: string, reason?: string) {
    return this.requestHandler.request<RESTDeleteAPIChannelResult>('DELETE', Endpoints.CHANNEL(channelID), true, {
      reason
    });
  }

  /**
   * Delete a channel permission overwrite
   * @param {string} channelID The ID of the channel
   * @param {string} overwriteID The ID of the overwritten user or role
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteChannelPermission(channelID: string, overwriteID: string, reason?: string) {
    return this.requestHandler.request<RESTDeleteAPIChannelPermissionResult>('DELETE', Endpoints.CHANNEL_PERMISSION(channelID, overwriteID), true, {
      reason
    });
  }

  /**
   * Delete a global application command
   * @param {string} commandID The command id
   * @returns {Promise}
   */
  deleteCommand(commandID: string) {
    return this.requestHandler.request('DELETE', Endpoints.COMMAND(this.application!.id, commandID), true);
  }

  /**
   * Delete a guild (bot user must be owner)
   * @param {string} guildID The ID of the guild
   * @returns {Promise}
   */
  deleteGuild(guildID: string) {
    return this.requestHandler.request('DELETE', Endpoints.GUILD(guildID), true);
  }

  /**
   * Delete a guild application command
   * @param {string} guildID The guild id
   * @param {string} commandID The command id
   * @returns {Promise}
   */
  deleteGuildCommand(guildID: string, commandID: string) {
    return this.requestHandler.request('DELETE', Endpoints.GUILD_COMMAND(this.application!.id, guildID, commandID), true);
  }

  /**
   * Delete a guild emoji object
   * @param {string} guildID The ID of the guild to delete the emoji in
   * @param {string} emojiID The ID of the emoji
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteGuildEmoji(guildID: string, emojiID: string, reason?: string) {
    return this.requestHandler.request('DELETE', Endpoints.GUILD_EMOJI(guildID, emojiID), true, {
      reason
    });
  }

  /**
   * Delete a guild integration
   * @param {string} guildID The ID of the guild
   * @param {string} integrationID The ID of the integration
   * @returns {Promise}
   */
  deleteGuildIntegration(guildID: string, integrationID: string) {
    return this.requestHandler.request('DELETE', Endpoints.GUILD_INTEGRATION(guildID, integrationID), true);
  }

  /**
   * Delete a guild sticker
   * @param {string} guildID The ID of the guild
   * @param {string} stickerID The ID of the sticker
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteGuildSticker(guildID: string, stickerID: string, reason?: string) {
    return this.requestHandler.request('DELETE', Endpoints.GUILD_STICKER(guildID, stickerID), true, {
      reason
    });
  }

  /**
   * Delete a guild template
   * @param {string} guildID The ID of the guild
   * @param {string} code The template code
   * @returns {Promise<GuildTemplate>}
   */
  deleteGuildTemplate(guildID: string, code: string) {
    return this.requestHandler.request<RESTDeleteAPIGuildTemplateResult>('DELETE', Endpoints.GUILD_TEMPLATE_GUILD(guildID, code), true).then((template) => new GuildTemplate(template, this));
  }

  /**
   * Delete an invite
   * @param {string} inviteID The ID of the invite
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteInvite(inviteID: string, reason?: string) {
    return this.requestHandler.request('DELETE', Endpoints.INVITE(inviteID), true, {
      reason
    });
  }

  /**
   * Delete a message
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteMessage(channelID: string, messageID: string, reason?: string) {
    return this.requestHandler.request('DELETE', Endpoints.CHANNEL_MESSAGE(channelID, messageID), true, {
      reason
    });
  }

  /**
   * Bulk delete messages (bot accounts only)
   * @param {string} channelID The ID of the channel
   * @param {Array<string>} messageIDs Array of message IDs to delete
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteMessages(channelID: string, messageIDs: string[], reason?: string): Promise<unknown> {
    if (messageIDs.length === 0) {
      return Promise.resolve();
    }
    if (messageIDs.length === 1) {
      return this.deleteMessage(channelID, messageIDs[0], reason);
    }

    const oldestAllowedSnowflake = (Date.now() - 1421280000000) * 4194304;
    const invalidMessage = messageIDs.find((messageID) => Number(messageID) < oldestAllowedSnowflake);
    if (invalidMessage) {
      return Promise.reject(new Error(`Message ${invalidMessage} is more than 2 weeks old.`));
    }

    if (messageIDs.length > 100) {
      return this.requestHandler
        .request('POST', Endpoints.CHANNEL_BULK_DELETE(channelID), true, {
          messages: messageIDs.splice(0, 100),
          reason
        })
        .then(() => this.deleteMessages(channelID, messageIDs, reason));
    }
    return this.requestHandler.request('POST', Endpoints.CHANNEL_BULK_DELETE(channelID), true, {
      messages: messageIDs,
      reason
    });
  }

  /**
   * Delete a guild role
   * @param {string} guildID The ID of the guild to create the role in
   * @param {string} roleID The ID of the role
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteRole(guildID: string, roleID: string, reason?: string) {
    return this.requestHandler.request('DELETE', Endpoints.GUILD_ROLE(guildID, roleID), true, {
      reason
    });
  }

  /**
   * Delete a stage instance
   * @param {string} channelID The stage channel associated with the instance
   * @returns {Promise}
   */
  deleteStageInstance(channelID: string) {
    return this.requestHandler.request('DELETE', Endpoints.STAGE_INSTANCE(channelID), true);
  }

  /**
   * Delete a webhook
   * @param {string} webhookID The ID of the webhook
   * @param {string} [token] The token of the webhook, used instead of the Bot Authorization token
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteWebhook(webhookID: string, token?: string, reason?: string) {
    return this.requestHandler.request('DELETE', token ? Endpoints.WEBHOOK_TOKEN(webhookID, token) : Endpoints.WEBHOOK(webhookID), !token, {
      reason
    });
  }

  /**
   * Delete a webhook message
   * @param {string} webhookID
   * @param {string} token
   * @param {string} messageID
   * @returns {Promise}
   */
  deleteWebhookMessage(webhookID: string, token: string, messageID: string) {
    return this.requestHandler.request('DELETE', Endpoints.WEBHOOK_MESSAGE(webhookID, token, messageID), false);
  }

  /**
   * Disconnects all shards
   * @param {Object?} [options] Shard disconnect options
   * @param {string | Boolean} [options.reconnect] false means destroy everything, true means you want to reconnect in the future, "auto" will autoreconnect
   */
  disconnect(options?: { reconnect: boolean | 'auto' }) {
    this.ready = false;
    this.shards.forEach((shard) => {
      shard.disconnect(options);
    });
    this.shards.connectQueue = [];
  }

  /**
   * Update the bot's AFK status. Setting this to true will enable push notifications for userbots.
   * @param {Boolean} afk Whether the bot user is AFK or not
   */
  editAFK(afk: boolean) {
    this.presence.afk = !!afk;

    this.shards.forEach((shard) => {
      shard.editAFK(afk);
    });
  }

  /**
   * Edit a channel's properties
   * @param {string} channelID The ID of the channel
   * @param {Object} options The properties to edit
   * @param {Boolean} [options.archived] The archive status of the channel (thread channels only)
   * @param {number} [options.autoArchiveDuration] The duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080 (thread channels only)
   * @param {number} [options.bitrate] The bitrate of the channel (guild voice channels only)
   * @param {Number?} [options.defaultAutoArchiveDuration] The default duration of newly created threads in minutes to automatically archive the thread after inactivity (60, 1440, 4320, 10080) (guild text/news channels only)
   * @param {string} [options.icon] The icon of the channel as a base64 data URI (group channels only). Note: base64 strings alone are not base64 data URI strings
   * @param {Boolean} [options.invitable] Whether non-moderators can add other non-moderators to the channel (private thread channels only)
   * @param {Boolean} [options.locked] The lock status of the channel (thread channels only)
   * @param {string} [options.name] The name of the channel
   * @param {Boolean} [options.nsfw] The nsfw status of the channel (guild channels only)
   * @param {string} [options.ownerID] The ID of the channel owner (group channels only)
   * @param {string?} [options.parentID] The ID of the parent channel category for this channel (guild text/voice channels only)
   * @param {Array<Object>} [options.permissionOverwrites] An array containing permission overwrite objects
   * @param {number} [options.position] The sorting position of the channel (guild channels only)
   * @param {number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (does not affect bots or users with manageMessages/manageChannel permissions) (guild text and thread channels only)
   * @param {string?} [options.rtcRegion] The RTC region ID of the channel (automatic if `null`) (guild voice channels only)
   * @param {string} [options.topic] The topic of the channel (guild text channels only)
   * @param {number} [options.userLimit] The channel user limit (guild voice channels only)
   * @param {number} [options.videoQualityMode] The camera video quality mode of the channel (guild voice channels only). `1` is auto, `2` is 720p
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<CategoryChannel | GroupChannel | TextChannel | TextVoiceChannel | NewsChannel | NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel>}
   */
  editChannel(channelID: string, options: RESTPatchAPIChannelJSONBody, reason?: string) {
    return this.requestHandler
      .request<RESTPatchAPIChannelResult>('PATCH', Endpoints.CHANNEL(channelID), true, {
        ...options,
        reason
      })
      .then((channel) => ChannelFactory.create(channel, this));
  }

  /**
   * Create a channel permission overwrite
   * @param {string} channelID The ID of channel
   * @param {string} overwriteID The ID of the overwritten user or role (everyone role ID = guild ID)
   * @param {BigInt} allow The permissions number for allowed permissions
   * @param {BigInt} deny The permissions number for denied permissions
   * @param {number} type The object type of the overwrite, either 1 for "member" or 0 for "role"
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  editChannelPermission(channelID: string, overwriteID: string, allow: bigint | number, deny: bigint | number, type: OverwriteType, reason?: string) {
    if (typeof type === 'string') {
      // backward compatibility
      type = type === 'member' ? 1 : 0;
    }
    return this.requestHandler.request<never>('PUT', Endpoints.CHANNEL_PERMISSION(channelID, overwriteID), true, {
      allow,
      deny,
      type,
      reason
    });
  }

  /**
   * Edit a guild channel's position. Note that channel position numbers are grouped by type (category, text, voice), then sorted in ascending order (lowest number is on top).
   * @param {string} channelID The ID of the channel
   * @param {number} position The new position of the channel
   * @param {Object} [options] Additional options when editing position
   * @param {Boolean} [options.lockPermissions] Whether to sync the channel's permissions with the new parent, if changing parents
   * @param {string} [options.parentID] The new parent ID (category channel) for the channel that is moved
   * @returns {Promise}
   */
  editChannelPosition(channelID: string, position: number, options: { lockPermissions?: boolean; parentID?: string } = {}) {
    const { channels } = this.guilds.get(this.channelGuildMap[channelID])!;
    const channel = channels.get(channelID);
    if (!channel) {
      return Promise.reject(new Error(`Channel ${channelID} not found`));
    }
    if (!channel.position) return Promise.reject(new Error(`Channel ${channelID} does not have a position`));
    if (channel.position === position) {
      return Promise.resolve();
    }
    const min = Math.min(position, channel.position);
    const max = Math.max(position, channel.position);
    const channelsArray = channels
      .filter((chan) => {
        return 'position' in chan && chan.type === channel.type && min <= chan.position! && chan.position! <= max && chan.id !== channelID;
      })
      .sort((a, b) => a.position! - b.position!);
    if (position > channel.position) {
      channelsArray.push(channel);
    } else {
      channelsArray.unshift(channel);
    }
    return this.requestHandler.request(
      'PATCH',
      Endpoints.GUILD_CHANNELS(this.channelGuildMap[channelID]),
      true,
      channelsArray.map((channel, index) => ({
        id: channel.id,
        position: index + min,
        lock_permissions: options.lockPermissions,
        parent_id: options.parentID
      }))
    );
  }

  /**
   * Edit multiple guild channels' positions. Note that channel position numbers are grouped by type (category, text, voice), then sorted in ascending order (lowest number is on top).
   * @param {string} guildID The ID of the guild
   * @param {Array<Object>} channelPositions An array of [ChannelPosition](https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions)
   * @param {string} channelPositions[].id The ID of the channel
   * @param {number} channelPositions[].position The new position of the channel
   * @param {Boolean} [channelPositions[].lockPermissions] Whether to sync the channel's permissions with the new parent, if changing parents
   * @param {string} [channelPositions[].parentID] The new parent ID (category channel) for the channel that is moved. For each request, only one channel can change parents
   * @returns {Promise}
   */
  editChannelPositions(guildID: string, channelPositions: RESTPatchAPIGuildChannelPositionsJSONBody) {
    return this.requestHandler.request('PATCH', Endpoints.GUILD_CHANNELS(guildID), true, channelPositions);
  }

  /**
   * Edit a global application command
   * @param {string} commandID The command id
   * @param {Object} command A command object
   * @param {string} command.name The command name
   * @param {string} [command.description] The command description (Slash Commands Only)
   * @param {Array<Object>} [command.options] An array of [command options](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)
   * @param {Boolean} [command.defaultPermission] Whether the command is enabled by default when the app is added to a guild
   * @returns {Promise<Object>} Resolves with a commands object
   */
  editCommand(commandID: string, command: RESTPatchAPIApplicationCommandJSONBody) {
    if (!commandID) {
      throw new Error('You must provide an id of the command to edit.');
    }
    if (command.name !== undefined) {
      if (command.type === 1 || command.type === undefined) {
        command.name = command.name.toLowerCase();
        if (!command.name.match(/^[\w-]{1,32}$/)) {
          throw new Error('Slash Command names must match the regular expression "^[\\w-]{1,32}$"');
        }
      }
    }
    return this.requestHandler.request<RESTPatchAPIApplicationCommandResult>('PATCH', Endpoints.COMMAND(this.application!.id, commandID), true, command);
  }

  /**
   * Edits command permissions for a specific command in a guild.
   * Note: You can only add up to 10 permission overwrites for a command.
   * @param {string} guildID The guild id
   * @param {string} commandID The command id
   * @param {Array<Object>} permissions An array of [permissions objects](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure)
   * @returns {Promise<Object>} Resolves with a [GuildApplicationCommandPermissions](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure) object.
   */
  editCommandPermissions(guildID: string, commandID: string, permissions: RESTPutAPIGuildApplicationCommandsPermissionsJSONBody) {
    return this.requestHandler.request<RESTPutAPIGuildApplicationCommandsPermissionsResult>('PUT', Endpoints.COMMAND_PERMISSIONS(this.application!.id, guildID, commandID), true, { permissions });
  }

  /**
   * Edit a guild
   * @param {string} guildID The ID of the guild
   * @param {Object} options The properties to edit
   * @param {string} [options.afkChannelID] The ID of the AFK voice channel
   * @param {number} [options.afkTimeout] The AFK timeout in seconds
   * @param {string} [options.banner] The guild banner image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
   * @param {number} [options.defaultNotifications] The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions".
   * @param {string} [options.description] The description for the guild (VIP only)
   * @param {string} [options.discoverySplash] The guild discovery splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
   * @param {number} [options.explicitContentFilter] The level of the explicit content filter for messages/images in the guild. 0 disables message scanning, 1 enables scanning the messages of members without roles, 2 enables scanning for all messages.
   * @param {Array<string>} [options.features] The enabled features for the guild. Note that only certain features can be toggled with the API
   * @param {string} [options.icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @param {string} [options.name] The name of the guild
   * @param {string} [options.ownerID] The ID of the user to transfer server ownership to (bot user must be owner)
   * @param {string} [options.preferredLocale] Preferred "COMMUNITY" guild language used in server discovery and notices from Discord
   * @param {string} [options.publicUpdatesChannelID] The id of the channel where admins and moderators of "COMMUNITY" guilds receive notices from Discord
   * @param {string} [options.rulesChannelID] The id of the channel where "COMMUNITY" guilds display rules and/or guidelines
   * @param {string} [options.splash] The guild splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
   * @param {number} [options.systemChannelFlags] The flags for the system channel
   * @param {string} [options.systemChannelID] The ID of the system channel
   * @param {number} [options.verificationLevel] The guild verification level
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Guild>}
   */
  editGuild(guildID: string, options: RESTPatchAPIGuildJSONBody, reason?: string) {
    return this.requestHandler
      .request<RESTPatchAPIGuildResult>('PATCH', Endpoints.GUILD(guildID), true, {
        ...options,
        reason
      })
      .then((guild) => new Guild(guild, this));
  }

  /**
   * Edit a guild application command
   * @param {string} guildID The guild id
   * @param {Object} command A command object
   * @param {string} command.name The command name
   * @param {string} [command.description] The command description (Slash Commands Only)
   * @param {Array<Object>} [command.options] An array of [command options](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)
   * @param {Boolean} [command.defaultPermission] Whether the command is enabled by default when the app is added to a guild
   * @returns {Promise<Object>} Resolves with a commands object
   */
  editGuildCommand(guildID: string, commandID: string, command: RESTPatchAPIApplicationGuildCommandJSONBody) {
    if (!commandID) {
      throw new Error('You must provide an id of the command to edit.');
    }
    if (command.name !== undefined) {
      if (command.type === 1 || command.type === undefined) {
        command.name = command.name.toLowerCase();
        if (!command.name.match(/^[\w-]{1,32}$/)) {
          throw new Error('Slash Command names must match the regular expression "^[\\w-]{1,32}$"');
        }
      }
    }
    return this.requestHandler.request<RESTPatchAPIApplicationGuildCommandResult>('PATCH', Endpoints.GUILD_COMMAND(this.application!.id, guildID, commandID), true, command);
  }

  /**
   * Edit a guild emoji object
   * @param {string} guildID The ID of the guild to edit the emoji in
   * @param {string} emojiID The ID of the emoji you want to modify
   * @param {Object} options Emoji options
   * @param {string} [options.name] The name of emoji
   * @param {Array} [options.roles] An array containing authorized role IDs
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} A guild emoji object
   */
  editGuildEmoji(guildID: string, emojiID: string, options: RESTPatchAPIGuildEmojiJSONBody, reason?: string) {
    return this.requestHandler.request<RESTPatchAPIGuildEmojiResult>('PATCH', Endpoints.GUILD_EMOJI(guildID, emojiID), true, {
      ...options,
      reason
    });
  }

  /**
   * Edit a guild member
   * @param {string} guildID The ID of the guild
   * @param {string} memberID The ID of the member (you can use "@me" if you are only editing the bot user's nickname)
   * @param {Object} options The properties to edit
   * @param {string?} [options.channelID] The ID of the voice channel to move the member to (must be in voice). Set to `null` to disconnect the member
   * @param {Date?} [options.communicationDisabledUntil] When the user's timeout should expire. Set to `null` to instantly remove timeout
   * @param {Boolean} [options.deaf] Server deafen the member
   * @param {Boolean} [options.mute] Server mute the member
   * @param {string} [options.nick] Set the member's server nickname, "" to remove
   * @param {Array<string>} [options.roles] The array of role IDs the member should have
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Member>}
   */
  editGuildMember(guildID: string, memberID: string, options: RESTPatchAPIGuildMemberJSONBody, reason?: string) {
    return this.requestHandler
      .request<RESTPatchAPIGuildMemberResult>('PATCH', Endpoints.GUILD_MEMBER(guildID, memberID), true, {
        ...options,
        reason
      })
      .then((member) => new Member(member, this.guilds.get(guildID)!));
  }

  /**
   * Edit a guild sticker
   * @param {string} stickerID The ID of the sticker
   * @param {Object} options The properties to edit
   * @param {string} [options.description] The description of the sticker
   * @param {string} [options.name] The name of the sticker
   * @param {string} [options.tags] The Discord name of a unicode emoji representing the sticker's expression
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} A sticker object
   */
  editGuildSticker(guildID: string, stickerID: string, options: RESTPatchAPIGuildStickerJSONBody, reason?: string) {
    return this.requestHandler.request<RESTPatchAPIGuildStickerResult>('PATCH', Endpoints.GUILD_STICKER(guildID, stickerID), true, { ...options, reason });
  }

  /**
   * Edit a guild template
   * @param {string} guildID The ID of the guild
   * @param {string} code The template code
   * @param {Object} options The properties to edit
   * @param {string} [options.name] The name of the template
   * @param {string?} [options.description] The description for the template. Set to `null` to remove the description
   * @returns {Promise<GuildTemplate>}
   */
  editGuildTemplate(guildID: string, code: string, options: RESTPatchAPIGuildTemplateJSONBody) {
    return this.requestHandler.request<RESTPatchAPIGuildTemplateResult>('PATCH', Endpoints.GUILD_TEMPLATE_GUILD(guildID, code), true, options).then((template) => new GuildTemplate(template, this));
  }

  /**
   * Modify a guild's vanity code
   * @param {string} guildID The ID of the guild
   * @param {string?} code The new vanity code
   * @returns {Promise<Object>}
   */
  editGuildVanity(guildID: string, code: string) {
    return this.requestHandler.request('PATCH', Endpoints.GUILD_VANITY_URL(guildID), true, {
      code
    });
  }
  /**
   * Update a user's voice state - See [caveats](https://discord.com/developers/docs/resources/guild#modify-user-voice-state-caveats)
   * @param {string} guildID The ID of the guild
   * @param {Object} options The properties to edit
   * @param {string} options.channelID The ID of the channel the user is currently in
   * @param {Date?} [options.requestToSpeakTimestamp] Sets the user's request to speak - this can only be used when the `userID` param is "@me"
   * @param {Boolean} [options.suppress] Toggles the user's suppress state
   * @param {string} [userID="@me"] The user ID of the user to update
   * @returns {Promise}
   */
  editGuildVoiceState(guildID: string, options: RESTPatchAPIGuildVoiceStateUserJSONBody, userID = '@me') {
    return this.requestHandler.request('PATCH', Endpoints.GUILD_VOICE_STATE(guildID, userID), true, options);
  }

  /**
   * Edit a guild welcome screen
   * @param {string} guildID The ID of the guild
   * @param {Object} [options] The properties to edit
   * @param {string?} [options.description] The description in the welcome screen
   * @param {Boolean} [options.enabled] Whether the welcome screen is enabled
   * @param {Array<Object>} [options.welcomeChannels] The list of channels in the welcome screen as an array
   * @param {string} options.welcomeChannels[].channelID The channel ID of the welcome channel
   * @param {string} options.welcomeChannels[].description The description of the welcome channel
   * @param {string?} options.welcomeChannels[].emojiID The emoji ID of the welcome channel
   * @param {string?} options.welcomeChannels[].emojiName The emoji name of the welcome channel
   * @returns {Promise<Object>}
   */
  editGuildWelcomeScreen(guildID: string, options: RESTPatchAPIGuildWelcomeScreenJSONBody) {
    return this.requestHandler.request<RESTPatchAPIGuildWelcomeScreenResult>('PATCH', Endpoints.GUILD_WELCOME_SCREEN(guildID), true, options);
  }

  /**
   * Modify a guild's widget
   * @param {string} guildID The ID of the guild
   * @param {Object} options The widget object to modify (https://discord.com/developers/docs/resources/guild#modify-guild-widget)
   * @returns {Promise<Object>} A guild widget object
   */
  editGuildWidget(guildID: string, options: RESTPatchAPIGuildWidgetSettingsJSONBody) {
    return this.requestHandler.request<RESTPatchAPIGuildWidgetSettingsResult>('PATCH', Endpoints.GUILD_WIDGET(guildID), true, options);
  }

  /**
   * Edit a message
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message
   * @param {string | Array | Object} content A string, array of strings, or object. If an object is passed:
   * @param {Object} [content.allowedMentions] A list of mentions to allow (overrides default)
   * @param {Boolean} [content.allowedMentions.everyone] Whether or not to allow @everyone/@here.
   * @param {Boolean | Array<string>} [content.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
   * @param {Boolean | Array<string>} [content.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
   * @param {Array<Object>} [content.components] An array of components. See [the official Discord API documentation entry](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
   * @param {string} [content.content] A content string
   * @param {Object} [content.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @param {Array<Object>} [content.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @param {Object | Array<Object>} [content.file] A file object (or an Array of them)
   * @param {Buffer} content.file[].file A buffer containing file data
   * @param {string} content.file[].name What to name the file
   * @param {number} [content.flags] A number representing the flags to apply to the message. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#message-object-message-flags) for flags reference
   * @returns {Promise<Message>}
   */
  editMessage(channelID: string, messageID: string, content: (RESTPatchAPIChannelMessageJSONBody & { embed?: APIEmbed; file?: FileType }) | string) {
    if (content !== undefined) {
      if (typeof content !== 'object' || content === null) {
        content = {
          content: '' + content
        };
      } else if (content.content !== undefined && typeof content.content !== 'string') {
        content.content = '' + content.content;
      } else if (content.embed) {
        if (!content.embeds) {
          content.embeds = [];
        }
        content.embeds.push(content.embed);
      }
      if (content.allowed_mentions) {
        content.allowed_mentions = this._formatAllowedMentions(content.allowed_mentions);
      }
    }
    return this.requestHandler.request<RESTPatchAPIChannelMessageResult>('PATCH', Endpoints.CHANNEL_MESSAGE(channelID, messageID), true, content, content.file).then((message) => new Message(message, this));
  }

  /**
   * Edit a guild role
   * @param {string} guildID The ID of the guild the role is in
   * @param {string} roleID The ID of the role
   * @param {Object} options The properties to edit
   * @param {number} [options.color] The hex color of the role, in number form (ex: 0x3da5b3 or 4040115)
   * @param {Boolean} [options.hoist] Whether to hoist the role in the user list or not
   * @param {string} [options.icon] The role icon as a base64 data URI
   * @param {Boolean} [options.mentionable] Whether the role is mentionable or not
   * @param {string} [options.name] The name of the role
   * @param {BigInt | Number | string | Permission} [options.permissions] The role permissions
   * @param {string} [options.unicodeEmoji] The role's unicode emoji
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Role>}
   */
  editRole(guildID: string, roleID: string, options: RESTPatchAPIGuildRoleJSONBody, reason?: string) {
    return this.requestHandler.request<RESTPatchAPIGuildRoleResult>('PATCH', Endpoints.GUILD_ROLE(guildID, roleID), true, { ...options, reason }).then((role) => new Role(role, this.guilds.get(guildID)!));
  }

  /**
   * Edit a guild role's position. Note that role position numbers are highest on top and lowest at the bottom.
   * @param {string} guildID The ID of the guild the role is in
   * @param {string} roleID The ID of the role
   * @param {number} position The new position of the role
   * @returns {Promise}
   */
  editRolePosition(guildID: string, roleID: string, position: number) {
    if (guildID === roleID) {
      return Promise.reject(new Error('Cannot move default role'));
    }
    const roles = this.guilds.get(guildID)!.roles;
    const role = roles.get(roleID);
    if (!role) {
      return Promise.reject(new Error(`Role ${roleID} not found`));
    }
    if (role.position === position) {
      return Promise.resolve();
    }
    const min = Math.min(position, role.position);
    const max = Math.max(position, role.position);
    const roleArray = roles.filter((role) => min <= role.position && role.position <= max && role.id !== roleID).sort((a, b) => a.position - b.position);
    if (position > role.position) {
      roleArray.push(role);
    } else {
      roleArray.unshift(role);
    }
    return this.requestHandler.request(
      'PATCH',
      Endpoints.GUILD_ROLES(guildID),
      true,
      roleArray.map((role, index) => ({
        id: role.id,
        position: index + min
      }))
    );
  }

  /**
   * Edit properties of the bot user
   * @param {Object} options The properties to edit
   * @param {string} [options.username] The new username
   * @param {string} [options.avatar] The new avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @returns {Promise<User>}
   */
  editSelf(options: RESTPatchAPICurrentUserJSONBody) {
    return this.requestHandler.request<RESTPatchAPICurrentUserResult>('PATCH', Endpoints.USER('@me'), true, options).then((data) => new User(data, this));
  }

  /**
   * Update a stage instance
   * @param {string} channelID The ID of the stage channel associated with the instance
   * @param {Object} options The properties to edit
   * @param {number} [options.privacyLevel] The privacy level of the stage instance. 1 is public, 2 is guild only
   * @param {string} [options.topic] The stage instance topic
   * @returns {Promise<StageInstance>}
   */
  editStageInstance(channelID: string, options: RESTPatchAPIStageInstanceJSONBody) {
    return this.requestHandler.request<RESTPatchAPIStageInstanceResult>('PATCH', Endpoints.STAGE_INSTANCE(channelID), true, options).then((instance) => new StageInstance(instance, this));
  }

  setStatus(status: PresenceUpdateStatus) {
    this.presence.status = status;
    this.updatePresence();
  }

  setActivity(type: ActivityType, name: string, state?: string, url?: string) {
    this.presence.activities = [{ name, state, type, url }];
    this.updatePresence();
  }

  setCustomActivity(status: string) {
    this.presence.activities = [{ name: 'status', state: status, type: ActivityType.Custom }];
    this.updatePresence();
  }

  setPresence(status: PresenceUpdateStatus, activities: Array<Omit<GatewayActivity, 'id' | 'created_at'>>) {
    this.presence.status = status;
    this.presence.activities = activities;
    this.updatePresence();
  }

  updatePresence() {
    this.shards.forEach((shard) => {
      shard.setPresence(this.presence.status, this.presence.activities);
    });
  }

  /**
   * Edit a webhook
   * @param {string} webhookID The ID of the webhook
   * @param {Object} options Webhook options
   * @param {string} [options.name] The new default name
   * @param {string} [options.avatar] The new default avatar as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @param {string} [options.channelID] The new channel ID where webhooks should be sent to
   * @param {string} [token] The token of the webhook, used instead of the Bot Authorization token
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} Resolves with a webhook object
   */
  editWebhook(webhookID: string, options: RESTPatchAPIWebhookJSONBody, token?: string, reason?: string) {
    return this.requestHandler.request('PATCH', token ? Endpoints.WEBHOOK_TOKEN(webhookID, token) : Endpoints.WEBHOOK(webhookID), !token, {
      ...options,
      reason
    });
  }

  /**
   * Edit a webhook message
   * @param {string} webhookID The ID of the webhook
   * @param {string} token The token of the webhook
   * @param {string} messageID The ID of the message
   * @param {Object} options Webhook message edit options
   * @param {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
   * @param {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here
   * @param {Boolean} [options.allowedMentions.repliedUser] Whether or not to mention the author of the message being replied to
   * @param {Boolean | Array<string>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow
   * @param {Boolean | Array<string>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow
   * @param {Array<Object>} [options.components] An array of components. See [the official Discord API documentation entry](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
   * @param {string} [options.content] A content string
   * @param {Object} [options.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @param {Array<Object>} [options.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @param {Object | Array<Object>} [options.file] A file object (or an Array of them)
   * @param {Buffer} options.file[].file A buffer containing file data
   * @param {string} options.file[].name What to name the file
   * @returns {Promise<Message>}
   */
  editWebhookMessage(webhookID: string, token: string, messageID: string, options: RESTPatchAPIWebhookWithTokenMessageJSONBody & { embed?: APIEmbed; file?: FileType }) {
    if (options.allowed_mentions) {
      options.allowed_mentions = this._formatAllowedMentions(options.allowed_mentions);
    }
    if (options.embed) {
      if (!options.embeds) {
        options.embeds = [];
      }
      options.embeds.push(options.embed);
    }
    return this.requestHandler.request<RESTPatchAPIWebhookWithTokenMessageResult>('PATCH', Endpoints.WEBHOOK_MESSAGE(webhookID, token, messageID), false, options, options.file).then((response) => new Message(response, this));
  }

  /**
   * Execute a webhook
   * @param {string} webhookID The ID of the webhook
   * @param {string} token The token of the webhook
   * @param {Object} options Webhook execution options
   * @param {Object} [options.allowedMentions] A list of mentions to allow (overrides default)
   * @param {Boolean} [options.allowedMentions.everyone] Whether or not to allow @everyone/@here.
   * @param {Boolean | Array<string>} [options.allowedMentions.roles] Whether or not to allow all role mentions, or an array of specific role mentions to allow.
   * @param {Boolean | Array<string>} [options.allowedMentions.users] Whether or not to allow all user mentions, or an array of specific user mentions to allow.
   * @param {Boolean} [options.auth=false] Whether or not to authenticate with the bot token.
   * @param {string} [options.avatarURL] A URL for a custom avatar, defaults to webhook default avatar if not specified
   * @param {Array<Object>} [options.components] An array of components. See [the official Discord API documentation entry](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
   * @param {string} [options.content] A content string
   * @param {Object} [options.embed] An embed object. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @param {Array<Object>} [options.embeds] An array of embed objects. See [the official Discord API documentation entry](https://discord.com/developers/docs/resources/channel#embed-object) for object structure
   * @param {Object | Array<Object>} [options.file] A file object (or an Array of them)
   * @param {Buffer} options.file.file A buffer containing file data
   * @param {string} options.file.name What to name the file
   * @param {number} [options.flags] Flags to execute the webhook with, 64 for ephemeral (Interaction webhooks only)
   * @param {string} [options.threadID] The ID of the thread channel in the webhook's channel to send the message to
   * @param {Boolean} [options.tts=false] Whether the message should be a TTS message or not
   * @param {string} [options.username] A custom username, defaults to webhook default username if not specified
   * @param {Boolean} [options.wait=false] Whether to wait for the server to confirm the message create or not
   * @returns {Promise<Message?>}
   */
  executeWebhook(webhookID: string, token: string, options: RESTPostAPIWebhookWithTokenJSONBody & { embed?: APIEmbed; file?: FileType; auth?: boolean; wait?: boolean; threadID?: string }) {
    let qs = '';
    if (options.wait) {
      qs += '&wait=true';
    }
    if (options.threadID) {
      qs += '&thread_id=' + options.threadID;
    }
    if (options.embed) {
      if (!options.embeds) {
        options.embeds = [];
      }
      options.embeds.push(options.embed);
    }
    return this.requestHandler
      .request<RESTPostAPIWebhookWithTokenResult>(
        'POST',
        Endpoints.WEBHOOK_TOKEN(webhookID, token) + (qs ? '?' + qs : ''),
        !!options.auth,
        {
          ...options,
          allowed_mentions: this._formatAllowedMentions(options.allowed_mentions),
          components: options.components
        },
        options.file
      )
      .then((response) => (options.wait ? new Message(response, this) : undefined));
  }

  /**
   * Follow a NewsChannel in another channel. This creates a webhook in the target channel
   * @param {string} channelID The ID of the NewsChannel
   * @param {string} webhookChannelID The ID of the target channel
   * @returns {Object} An object containing the NewsChannel's ID and the new webhook's ID
   */
  followChannel(channelID: string, webhookChannelID: string) {
    return this.requestHandler.request<RESTPostAPIChannelFollowersResult>('POST', Endpoints.CHANNEL_FOLLOW(channelID), true, { webhook_channel_id: webhookChannelID });
  }

  /**
   * Get all active threads in a guild
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Object>} An object containing an array of `threads` and an array of `members`
   */
  getActiveGuildThreads(guildID: string) {
    return this.requestHandler.request<RESTGetAPIGuildThreadsResult>('GET', Endpoints.THREADS_GUILD_ACTIVE(guildID), true).then((response) => {
      return {
        members: response.members.map((member) => new ThreadMember(member, this)),
        threads: response.threads.map((thread) => ChannelFactory.create(thread, this))
      };
    });
  }

  /**
   * Get all archived threads in a channel
   * @param {string} channelID The ID of the channel
   * @param {string} type The type of thread channel, either "public" or "private"
   * @param {Object} [options] Additional options when requesting archived threads
   * @param {Date} [options.before] List of threads to return before the timestamp
   * @param {number} [options.limit] Maximum number of threads to return
   * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
   */
  getArchivedThreads(channelID: string, type: 'public' | 'private', options: RESTGetAPIChannelThreadsArchivedQuery = {}) {
    return this.requestHandler.request<RESTGetAPIChannelThreadsArchivedPublicResult>('GET', Endpoints.THREADS_ARCHIVED(channelID, type), true, options).then((response) => {
      return {
        hasMore: response.has_more,
        members: response.members.map((member) => new ThreadMember(member, this)),
        threads: response.threads.map((thread) => ChannelFactory.create(thread, this))
      };
    });
  }

  /**
   * Get general and bot-specific info on connecting to the Discord gateway (e.g. connection ratelimit)
   * @returns {Promise<RESTGetAPIGatewayBotResult>} Resolves with an object containing gateway connection info
   */
  getBotGateway() {
    if (!this._token.startsWith('Bot ')) {
      this._token = 'Bot ' + this._token;
    }
    return this.requestHandler.request<RESTGetAPIGatewayBotResult>('GET', Endpoints.GATEWAY_BOT, true);
  }

  /**
   * Get a Channel object from a channel ID
   * @param {string} channelID The ID of the channel
   * @returns {ChannelType | undefined}
   */
  getChannel(channelID: string): ChannelTypes | undefined {
    if (!channelID) {
      throw new Error(`Invalid channel ID: ${channelID}`);
    }

    if (this.channelGuildMap[channelID] && this.guilds.get(this.channelGuildMap[channelID])) {
      return this.guilds.get(this.channelGuildMap[channelID])?.channels.get(channelID);
    }
    if (this.threadGuildMap[channelID] && this.guilds.get(this.threadGuildMap[channelID])) {
      return this.guilds.get(this.threadGuildMap[channelID])?.threads.get(channelID);
    }
    return this.privateChannels.get(channelID);
  }

  /**
   * Get all invites in a channel
   * @param {string} channelID The ID of the channel
   * @returns {Promise<Array<Invite>>}
   */
  getChannelInvites(channelID: string) {
    return this.requestHandler.request<RESTGetAPIChannelInvitesResult>('GET', Endpoints.CHANNEL_INVITES(channelID), true).then((invites) => invites.map((invite) => new Invite(invite, this)));
  }

  /**
   * Get all the webhooks in a channel
   * @param {string} channelID The ID of the channel to get webhooks for
   * @returns {Promise<Array<Object>>} Resolves with an array of webhook objects
   */
  getChannelWebhooks(channelID: string) {
    return this.requestHandler.request<RESTGetAPIChannelWebhooksResult>('GET', Endpoints.CHANNEL_WEBHOOKS(channelID), true);
  }

  /**
   * Get a global application command
   * @param {string} commandID The command id
   * @returns {Promise<Object>} Resolves with an application command object.
   */
  getCommand(commandID: string) {
    if (!commandID) {
      throw new Error('You must provide an id of the command to get.');
    }
    return this.requestHandler.request<RESTGetAPIApplicationCommandResult>('GET', Endpoints.COMMAND(this.application!.id, commandID), true);
  }

  /**
   * Get the a guild's application command permissions
   * @param {string} guildID The guild id
   * @param {string} commandID The command id
   * @returns {Promise<Object>} Resolves with a guild application command permissions object.
   */
  getCommandPermissions(guildID: string, commandID: string) {
    if (!guildID) {
      throw new Error('You must provide an id of the guild whose permissions you want to get.');
    }
    if (!commandID) {
      throw new Error('You must provide an id of the command whose permissions you want to get.');
    }
    return this.requestHandler.request<RESTGetAPIApplicationCommandPermissionsResult>('GET', Endpoints.COMMAND_PERMISSIONS(this.application!.id, guildID, commandID), true);
  }

  /**
   * Get the global application commands
   * @returns {Promise<Array<Object>>} Resolves with an array of application command objects.
   */
  getCommands() {
    return this.requestHandler.request<RESTGetAPIApplicationCommandsResult>('GET', Endpoints.COMMANDS(this.application!.id), true);
  }

  /**
   * Get a DM channel with a user, or create one if it does not exist
   * @param {string} userID The ID of the user
   * @returns {Promise<PrivateChannel>}
   */
  getDMChannel(userID: string) {
    if (this.privateChannelMap[userID]) {
      return Promise.resolve(this.privateChannels.get(this.privateChannelMap[userID]));
    }
    return this.requestHandler
      .request<RESTPostAPICurrentUserCreateDMChannelResult>('POST', Endpoints.USER_CHANNELS('@me'), true, {
        recipients: [userID],
        type: 1
      })
      .then((privateChannel) => {
        const channel = new PrivateChannel(privateChannel as unknown as APIDMChannel, this);
        this.privateChannels.update(channel);
        this.privateChannelMap[userID] = channel.id;
        return channel;
      });
  }

  /**
   * Get info on connecting to the Discord gateway
   * @returns {Promise<RESTGetAPIGatewayResult>} Resolves with an object containing gateway connection info
   */
  getGateway() {
    return this.requestHandler.request<RESTGetAPIGatewayResult>('GET', Endpoints.GATEWAY);
  }

  /**
   * Get the audit log for a guild
   * @param {string} guildID The ID of the guild to get audit logs for
   * @param {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @param {number} [options.actionType] Filter entries by action type
   * @param {string} [options.before] Get entries before this entry ID
   * @param {number} [options.limit=50] The maximum number of entries to return
   * @param {string} [options.userID] Filter entries by the user that performed the action
   * @returns {Promise<{entries: Array<GuildAuditLogEntry>, integrations: Array<PartialIntegration>, threads: Array<NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel>, users: Array<User>, webhooks: Array<Webhook>}>}
   */
  getGuildAuditLog(guildID: string, options: RESTGetAPIAuditLogQuery) {
    return this.requestHandler.request<RESTGetAPIAuditLogResult>('GET', Endpoints.GUILD_AUDIT_LOGS(guildID), true, options).then((data) => {
      const guild = this.guilds.get(guildID)!;
      const users = data.users.map((user) => this.users.add(user, this));
      const threads = data.threads.map((thread) => guild.threads.update(thread, this));
      return {
        entries: data.audit_log_entries.map((entry) => new GuildAuditLogEntry(entry, guild)),
        integrations: data.integrations.map((integration) => new GuildIntegration(integration, guild)),
        threads,
        users,
        webhooks: data.webhooks
      };
    });
  }

  /**
   * Get a ban from the ban list of a guild
   * @param {string} guildID The ID of the guild
   * @param {string} userID The ID of the banned user
   * @returns {Promise<Object>} Resolves with {reason: string, user: User}
   */
  getGuildBan(guildID: string, userID: string) {
    return this.requestHandler.request<RESTGetAPIGuildBanResult>('GET', Endpoints.GUILD_BAN(guildID, userID), true).then((data) => {
      const ban = data as unknown as Omit<RESTGetAPIGuildBanResult, 'user'> & { user: User };
      ban.user = new User(ban.user, this);
      return ban;
    });
  }

  /**
   * Get the ban list of a guild
   * @param {string} guildID The ID of the guild
   * @param {Object} [options] Options for the request
   * @param {string} [options.after] Only get users after given user ID
   * @param {string} [options.before] Only get users before given user ID
   * @param {number} [options.limit=1000] The maximum number of users to return
   * @returns {Promise<Array<Object>>} Resolves with an array of { reason: string, user: User }
   */
  async getGuildBans(guildID: string, options?: RESTGetAPIGuildBansQuery) {
    const bans = await this.requestHandler.request<RESTGetAPIGuildBansResult>('GET', Endpoints.GUILD_BANS(guildID), true, options);

    const data: Array<Omit<RESTGetAPIGuildBanResult, 'user'> & { user: User }> = [];

    for (const ban of bans as unknown as Array<Omit<RESTGetAPIGuildBanResult, 'user'> & { user: User }>) {
      ban.user = this.users.update(ban.user, this);
    }

    return data;
  }

  /**
   * Get a guild application command
   * @param {string} guildID The guild id
   * @param {string} commandID The command id
   * @returns {Promise<Object>} Resolves with an command object.
   */
  getGuildCommand(guildID: string, commandID: string) {
    return this.requestHandler.request<RESTGetAPIApplicationGuildCommandResult>('GET', Endpoints.GUILD_COMMAND(this.application!.id, guildID, commandID), true);
  }

  /**
   * Get the all of a guild's application command permissions
   * @param {string} guildID The guild id
   * @returns {Promise<Array<Object>>} Resolves with an array of guild application command permissions objects.
   */
  getGuildCommandPermissions(guildID: string) {
    return this.requestHandler.request<RESTGetAPIApplicationCommandPermissionsResult>('GET', Endpoints.GUILD_COMMAND_PERMISSIONS(this.application!.id, guildID), true);
  }

  /**
   * Get a guild's application commands
   * @param {string} guildID The guild id
   * @returns {Promise<Array<Object>>} Resolves with an array of command objects.
   */
  getGuildCommands(guildID: string) {
    return this.requestHandler.request<RESTGetAPIApplicationGuildCommandsResult>('GET', Endpoints.GUILD_COMMANDS(this.application!.id, guildID), true);
  }

  /**
   * Get a list of integrations for a guild
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Array<GuildIntegration>>}
   */
  getGuildIntegrations(guildID: string) {
    const guild = this.guilds.get(guildID)!;
    return this.requestHandler.request<RESTGetAPIGuildIntegrationsResult>('GET', Endpoints.GUILD_INTEGRATIONS(guildID), true).then((integrations) => integrations.map((integration) => new GuildIntegration(integration, guild)));
  }

  /**
   * Get all invites in a guild
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Array<Invite>>}
   */
  getGuildInvites(guildID: string) {
    return this.requestHandler.request<RESTGetAPIGuildInvitesResult>('GET', Endpoints.GUILD_INVITES(guildID), true).then((invites) => invites.map((invite) => new Invite(invite, this)));
  }

  /**
   * Get a guild preview for a guild. Only available for community guilds.
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Object>}
   */
  getGuildPreview(guildID: string) {
    return this.requestHandler.request<RESTGetAPIGuildPreviewResult>('GET', Endpoints.GUILD_PREVIEW(guildID), true).then((data) => new GuildPreview(data, this));
  }

  /**
   * Get a guild template
   * @param {string} code The template code
   * @returns {Promise<GuildTemplate>}
   */
  getGuildTemplate(code: string) {
    return this.requestHandler.request<RESTGetAPITemplateResult>('GET', Endpoints.GUILD_TEMPLATE(code), true).then((template) => new GuildTemplate(template, this));
  }

  /**
   * Get a guild's templates
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Array<GuildTemplate>>}
   */
  getGuildTemplates(guildID: string) {
    return this.requestHandler.request<RESTGetAPIGuildTemplatesResult>('GET', Endpoints.GUILD_TEMPLATES(guildID), true).then((templates) => templates.map((t) => new GuildTemplate(t, this)));
  }

  /**
   * Returns the vanity url of the guild
   * @param {string} guildID The ID of the guild
   * @returns {Promise}
   */
  getGuildVanity(guildID: string) {
    return this.requestHandler.request<RESTGetAPIGuildVanityUrlResult>('GET', Endpoints.GUILD_VANITY_URL(guildID), true);
  }

  /**
   * Get all the webhooks in a guild
   * @param {string} guildID The ID of the guild to get webhooks for
   * @returns {Promise<Array<Object>>} Resolves with an array of webhook objects
   */
  getGuildWebhooks(guildID: string) {
    return this.requestHandler.request<RESTGetAPIGuildWebhooksResult>('GET', Endpoints.GUILD_WEBHOOKS(guildID), true);
  }

  /**
   * Get the welcome screen of a Community guild, shown to new members
   * @param {string} guildID The ID of the guild to get the welcome screen for
   * @returns {Promise<Object>}
   */
  getGuildWelcomeScreen(guildID: string) {
    return this.requestHandler.request<RESTGetAPIGuildWelcomeScreenResult>('GET', Endpoints.GUILD_WELCOME_SCREEN(guildID), true);
  }

  /**
   * Get a guild's widget object
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Object>} A guild widget object
   */
  getGuildWidget(guildID: string) {
    return this.requestHandler.request<RESTGetAPIGuildWidgetJSONResult>('GET', Endpoints.GUILD_WIDGET(guildID), true);
  }

  /**
   * Get a guild's widget settings object. Requires MANAGE_GUILD permission
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Object>} A guild widget setting object
   */
  getGuildWidgetSettings(guildID: string) {
    return this.requestHandler.request<RESTGetAPIGuildWidgetSettingsResult>('GET', Endpoints.GUILD_WIDGET_SETTINGS(guildID), true);
  }

  /**
   * Get info on an invite
   * @param {string} inviteID The ID of the invite
   * @param {Boolean} [withCounts] Whether to fetch additional invite info or not (approximate member counts, approximate presences, channel counts, etc.)
   * @returns {Promise<Invite>}
   */
  getInvite(inviteID: string, withCounts?: boolean) {
    return this.requestHandler
      .request<RESTGetAPIInviteResult>('GET', Endpoints.INVITE(inviteID), true, {
        with_counts: withCounts
      })
      .then((invite) => new Invite(invite, this));
  }

  /**
   * Get joined private archived threads in a channel
   * @param {string} channelID The ID of the channel
   * @param {Object} [options] Additional options when requesting archived threads
   * @param {Date} [options.before] List of threads to return before the timestamp
   * @param {number} [options.limit] Maximum number of threads to return
   * @returns {Promise<Object>} An object containing an array of `threads`, an array of `members` and whether the response `hasMore` threads that could be returned in a subsequent call
   */
  getJoinedPrivateArchivedThreads(channelID: string, options: RESTGetAPIChannelMessageReactionUsersQuery = {}) {
    return this.requestHandler.request<RESTGetAPIChannelUsersThreadsArchivedResult>('GET', Endpoints.THREADS_ARCHIVED_JOINED(channelID), true, options).then((response) => {
      return {
        hasMore: response.has_more,
        members: response.members.map((member) => new ThreadMember(member, this)),
        threads: response.threads.map((thread) => ChannelFactory.create(thread, this))
      };
    });
  }

  /**
   * Get a previous message in a channel
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message
   * @returns {Promise<Message>}
   */
  getMessage(channelID: string, messageID: string) {
    return this.requestHandler.request<RESTGetAPIChannelMessageResult>('GET', Endpoints.CHANNEL_MESSAGE(channelID, messageID), true).then((message) => new Message(message, this));
  }

  /**
   * Get a list of users who reacted with a specific reaction
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message
   * @param {string} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @param {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @param {number} [options.limit=100] The maximum number of users to get
   * @param {string} [options.after] Get users after this user ID
   * @param {string} [before] [DEPRECATED] Get users before this user ID. Discord no longer supports this parameter
   * @param {string} [after] [DEPRECATED] Get users after this user ID
   * @returns {Promise<Array<User>>}
   */
  getMessageReaction(channelID: string, messageID: string, reaction: string, options: RESTGetAPIChannelMessageReactionUsersQuery = {}) {
    if (reaction === decodeURI(reaction)) {
      reaction = encodeURIComponent(reaction);
    }
    if (!options || typeof options !== 'object') {
      options = {
        limit: options
      };
    }
    if (options.limit === undefined) {
      // Legacy behavior
      options.limit = 100;
    }
    return this.requestHandler.request<RESTGetAPIChannelMessageReactionUsersResult>('GET', Endpoints.CHANNEL_MESSAGE_REACTION(channelID, messageID, reaction), true, options).then((users) => users.map((user) => new User(user, this)));
  }

  /**
   * Get previous messages in a channel
   * @param {string} channelID The ID of the channel
   * @param {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @param {string} [options.after] Get messages after this message ID
   * @param {string} [options.around] Get messages around this message ID (does not work with limit > 100)
   * @param {string} [options.before] Get messages before this message ID
   * @param {number} [options.limit=50] The max number of messages to get
   * @param {string} [before] [DEPRECATED] Get messages before this message ID
   * @param {string} [after] [DEPRECATED] Get messages after this message ID
   * @param {string} [around] [DEPRECATED] Get messages around this message ID (does not work with limit > 100)
   * @returns {Promise<Array<Message>>}
   */
  async getMessages(channelID: string, options: RESTGetAPIChannelMessagesQuery = {}) {
    if (!options || typeof options !== 'object') {
      options = {
        limit: options
      };
    }
    if (options.limit === undefined) {
      // Legacy behavior
      options.limit = 50;
    }
    let limit = options.limit;
    if (limit && limit > 100) {
      let logs: Message[] = [];
      const get = async (_before: string | undefined, _after: string | undefined): Promise<Message[]> => {
        const messages = await this.requestHandler.request<RESTGetAPIChannelMessagesResult>('GET', Endpoints.CHANNEL_MESSAGES(channelID), true, {
          limit: 100,
          before: _before ?? undefined,
          after: _after ?? undefined
        });
        if (limit <= messages.length) {
          return _after
            ? messages
                .slice(messages.length - limit, messages.length)
                .map((message) => new Message(message, this))
                .concat(logs)
            : logs.concat(messages.slice(0, limit).map((message) => new Message(message, this)));
        }
        limit -= messages.length;
        logs = _after ? messages.map((message) => new Message(message, this)).concat(logs) : logs.concat(messages.map((message) => new Message(message, this)));
        if (messages.length < 100) {
          return logs;
        }
        this.emit('debug', `Getting ${limit} more messages during getMessages for ${channelID}: ${_before} ${_after}`, -1);
        // @ts-expect-error -- this
        return await get((_before || !_after) && messages[messages.length - 1].id, _after && messages[0].id); // eslint-disable-line -- this
      };
      return await get(options.before, options.after);
    }
    const messages = await this.requestHandler.request<RESTGetAPIChannelMessagesResult>('GET', Endpoints.CHANNEL_MESSAGES(channelID), true, options);
    return messages.map((message) => {
      try {
        return new Message(message, this);
      } catch (err) {
        this.emit('error', `Error creating message from channel messages\n${(err as Error).stack}\n${JSON.stringify(messages)}`);
        return null;
      }
    });
  }

  /**
   * Get the list of sticker packs available to Nitro subscribers
   * @returns {Promise<Object>} An object whichs contains a value which contains an array of sticker packs
   */
  getNitroStickerPacks() {
    return this.requestHandler.request('GET', Endpoints.STICKER_PACKS, true);
  }

  /**
   * Get data on an OAuth2 application
   * @param {string} [appID="@me"] The client ID of the application to get data for (user accounts only). "@me" refers to the logged in user's own application
   * @returns {Promise<Object>} The bot's application data. Refer to [the official Discord API documentation entry](https://discord.com/developers/docs/topics/oauth2#get-current-application-information) for object structure
   */
  getOAuthApplication(appID: string) {
    return this.requestHandler.request<RESTGetAPIOAuth2CurrentApplicationResult>('GET', Endpoints.OAUTH2_APPLICATION(appID || '@me'), true);
  }

  /**
   * Get all the pins in a channel
   * @param {string} channelID The ID of the channel
   * @returns {Promise<Array<Message>>}
   */
  getPins(channelID: string) {
    return this.requestHandler.request<RESTGetAPIChannelPinsResult>('GET', Endpoints.CHANNEL_PINS(channelID), true).then((messages) => messages.map((message) => new Message(message, this)));
  }

  /**
   * Get the prune count for a guild
   * @param {string} guildID The ID of the guild
   * @param {number} [options] The options to use to get number of prune members
   * @param {number} [options.days=7] The number of days of inactivity to prune for
   * @param {Array<string>} [options.includeRoles] An array of role IDs that members must have to be considered for pruning
   * @returns {Promise<Number>} Resolves with the number of members that would be pruned
   */
  getPruneCount(guildID: string, options: RESTGetAPIGuildPruneCountQuery = {}) {
    return this.requestHandler.request<RESTGetAPIGuildPruneCountResult>('GET', Endpoints.GUILD_PRUNE(guildID), true, options).then((data) => data.pruned);
  }

  /**
   * Get a channel's data via the REST API. REST mode is required to use this endpoint.
   * @param {string} channelID The ID of the channel
   * @returns {Promise<CategoryChannel | GroupChannel | PrivateChannel | TextChannel | TextVoiceChannel | NewsChannel | NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel>}
   */
  getRESTChannel(channelID: string) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIChannelResult>('GET', Endpoints.CHANNEL(channelID), true).then((channel) => ChannelFactory.create(channel, this));
  }

  /**
   * Get a guild's data via the REST API. REST mode is required to use this endpoint.
   * @param {string} guildID The ID of the guild
   * @param {Boolean} [withCounts=false] Whether the guild object will have approximateMemberCount and approximatePresenceCount
   * @returns {Promise<Guild>}
   */
  getRESTGuild(guildID: string, withCounts = false) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler
      .request<RESTGetAPIGuildResult>('GET', Endpoints.GUILD(guildID), true, {
        with_counts: withCounts
      })
      .then((guild) => new Guild(guild, this));
  }

  /**
   * Get a guild's channels via the REST API. REST mode is required to use this endpoint.
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Array<CategoryChannel> | Array<TextChannel> | Array<TextVoiceChannel> | Array<NewsChannel>>}
   */
  getRESTGuildChannels(guildID: string) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIGuildChannelsResult>('GET', Endpoints.GUILD_CHANNELS(guildID), true).then((channels) => channels.map((channel) => ChannelFactory.create(channel, this)));
  }

  /**
   * Get a guild emoji via the REST API. REST mode is required to use this endpoint.
   * @param {string} guildID The ID of the guild
   * @param {string} emojiID The ID of the emoji
   * @returns {Promise<Object>} An emoji object
   */
  getRESTGuildEmoji(guildID: string, emojiID: string) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIGuildEmojiResult>('GET', Endpoints.GUILD_EMOJI(guildID, emojiID), true);
  }

  /**
   * Get a guild's emojis via the REST API. REST mode is required to use this endpoint.
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Array<Object>>} An array of guild emoji objects
   */
  getRESTGuildEmojis(guildID: string) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIGuildEmojisResult>('GET', Endpoints.GUILD_EMOJIS(guildID), true);
  }

  /**
   * Get a guild's members via the REST API. REST mode is required to use this endpoint.
   * @param {string} guildID The ID of the guild
   * @param {string} memberID The ID of the member
   * @returns {Promise<Member>}
   */
  getRESTGuildMember(guildID: string, memberID: string) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIGuildMemberResult>('GET', Endpoints.GUILD_MEMBER(guildID, memberID), true).then((member) => new Member(member, this.guilds.get(guildID)!));
  }

  /**
   * Get a guild's members via the REST API. REST mode is required to use this endpoint.
   * @param {string} guildID The ID of the guild
   * @param {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @param {string} [options.after] The highest user ID of the previous page
   * @param {number} [options.limit=1] The max number of members to get (1 to 1000)
   * @param {string} [after] [DEPRECATED] The highest user ID of the previous page
   * @returns {Promise<Array<Member>>}
   */
  getRESTGuildMembers(guildID: string, options: RESTGetAPIGuildMembersQuery = {}) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIGuildMembersResult>('GET', Endpoints.GUILD_MEMBERS(guildID), true, options).then((members) => members.map((member) => new Member(member, this.guilds.get(guildID)!)));
  }

  /**
   * Get a guild's roles via the REST API. REST mode is required to use this endpoint.
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Array<Role>>}
   */
  getRESTGuildRoles(guildID: string) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIGuildRolesResult>('GET', Endpoints.GUILD_ROLES(guildID), true).then((roles) => roles.map((role) => new Role(role, null)));
  }

  /**
   * Get a list of the user's guilds via the REST API. REST mode is required to use this endpoint.
   * @param {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @param {string} [options.after] The highest guild ID of the previous page
   * @param {string} [options.before] The lowest guild ID of the next page
   * @param {number} [options.limit=100] The max number of guilds to get (1 to 1000)
   * @param {string} [before] [DEPRECATED] The lowest guild ID of the next page
   * @param {string} [after] [DEPRECATED] The highest guild ID of the previous page
   * @returns {Promise<Array<Guild>>}
   */
  getRESTGuilds(options: RESTGetAPICurrentUserGuildsQuery = {}) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    if (!options || typeof options !== 'object') {
      options = {
        limit: options
      };
    }
    return this.requestHandler.request<RESTGetAPICurrentUserGuildsResult>('GET', Endpoints.USER_GUILDS('@me'), true, options).then((guilds) => guilds.map((guild) => new Guild(guild, this)));
  }

  /**
   * Get a guild sticker via the REST API. REST mode is required to use this endpoint.
   * @param {string} guildID The ID of the guild
   * @param {string} stickerID The ID of the sticker
   * @returns {Promise<Object>} A sticker object
   */
  getRESTGuildSticker(guildID: string, stickerID: string) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIGuildStickerResult>('GET', Endpoints.GUILD_STICKER(guildID, stickerID), true);
  }

  /**
   * Get a guild's stickers via the REST API. REST mode is required to use this endpoint.
   * @param {string} guildID The ID of the guild
   * @returns {Promise<Array<Object>>} An array of guild sticker objects
   */
  getRESTGuildStickers(guildID: string) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIGuildStickersResult>('GET', Endpoints.GUILD_STICKERS(guildID), true);
  }

  /**
   * Get a sticker via the REST API. REST mode is required to use this endpoint.
   * @param {string} stickerID The ID of the sticker
   * @returns {Promise<Object>} A sticker object
   */
  getRESTSticker(stickerID: string) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIStickerResult>('GET', Endpoints.STICKER(stickerID), true);
  }

  /**
   * Get a user's data via the REST API. REST mode is required to use this endpoint.
   * @param {string} userID The ID of the user
   * @returns {Promise<User>}
   */
  getRESTUser(userID: string) {
    if (!this.options.restMode) {
      return Promise.reject(new Error('astri-ts REST mode is not enabled'));
    }
    return this.requestHandler.request<RESTGetAPIUserResult>('GET', Endpoints.USER(userID), true).then((user) => new User(user, this));
  }

  /**
   * Get properties of the bot user
   * @returns {Promise<ExtendedUser>}
   */
  getSelf() {
    return this.requestHandler.request<RESTGetAPIUserResult>('GET', Endpoints.USER('@me'), true).then((data) => new User(data, this));
  }

  /**
   * Get the stage instance associated with a stage channel
   * @param {string} channelID The stage channel ID
   * @returns {Promise<StageInstance>}
   */
  getStageInstance(channelID: string) {
    return this.requestHandler.request<RESTGetAPIStageInstanceResult>('GET', Endpoints.STAGE_INSTANCE(channelID), true).then((instance) => new StageInstance(instance, this));
  }

  /**
   * Get a list of members that are part of a thread channel
   * @param {string} channelID The ID of the thread channel
   * @returns {Promise<Array<ThreadMember>>}
   */
  getThreadMembers(channelID: string) {
    return this.requestHandler.request<RESTGetAPIChannelThreadMembersResult>('GET', Endpoints.THREAD_MEMBERS(channelID), true).then((members) => members.map((member) => new ThreadMember(member, this)));
  }

  /**
   * Get a list of general/guild-specific voice regions
   * @param {string} [guildID] The ID of the guild
   * @returns {Promise<Array<Object>>} Resolves with an array of voice region objects
   */
  getVoiceRegions(guildID: string) {
    return guildID ? this.requestHandler.request('GET', Endpoints.GUILD_VOICE_REGIONS(guildID), true) : this.requestHandler.request<RESTGetAPIVoiceRegionsResult>('GET', Endpoints.VOICE_REGIONS, true);
  }

  /**
   * Get a webhook
   * @param {string} webhookID The ID of the webhook
   * @param {string} [token] The token of the webhook, used instead of the Bot Authorization token
   * @returns {Promise<Object>} Resolves with a webhook object
   */
  getWebhook(webhookID: string, token?: string) {
    return this.requestHandler.request<RESTGetAPIWebhookResult>('GET', token ? Endpoints.WEBHOOK_TOKEN(webhookID, token) : Endpoints.WEBHOOK(webhookID), !token);
  }

  /**
   * Get a webhook message
   * @param {string} webhookID The ID of the webhook
   * @param {string} token The token of the webhook
   * @param {string} messageID The message ID of a message sent by this webhook
   * @returns {Promise<Message>} Resolves with a webhook message
   */
  getWebhookMessage(webhookID: string, token: string, messageID: string) {
    return this.requestHandler.request<RESTGetAPIWebhookWithTokenMessageResult>('GET', Endpoints.WEBHOOK_MESSAGE(webhookID, token, messageID)).then((message) => new Message(message, this));
  }

  /**
   * Join a thread
   * @param {string} channelID The ID of the thread channel
   * @param {string} [userID="@me"] The user ID of the user joining
   * @returns {Promise}
   */
  joinThread(channelID: string, userID = '@me') {
    return this.requestHandler.request('PUT', Endpoints.THREAD_MEMBER(channelID, userID), true);
  }

  /**
   * Join a voice channel. If joining a group call, the voice connection ID will be stored in voiceConnections as "call". Otherwise, it will be the guild ID
   * @param {string} channelID The ID of the voice channel
   * @param {Object} [options] VoiceConnection constructor options
   * @param {Object} [options.opusOnly] Skip opus encoder initialization. You should not enable this unless you know what you are doing
   * @param {Object} [options.shared] Whether the VoiceConnection will be part of a SharedStream or not
   * @param {Boolean} [options.selfMute] Whether the bot joins the channel muted or not
   * @param {Boolean} [options.selfDeaf] Whether the bot joins the channel deafened or not
   * @returns {Promise<VoiceConnection>} Resolves with a VoiceConnection
   */
  joinVoiceChannel(channelID: string, options: { opusOnly?: boolean; shared?: boolean; selfMute?: boolean; selfDeaf?: boolean } = {}) {
    const channel = this.getChannel(channelID);
    if (!channel) {
      return Promise.reject(new Error('Channel not found'));
    }
    if (channel.inGuild() && channel.guild.members.has(this.user.id) && !channel.permissionsOf(this.user.id).has(PermissionFlagsBits.Connect)) {
      return Promise.reject(new Error('Insufficient permission to connect to voice channel'));
    }
    this.shards.get(this.guildShardMap[this.channelGuildMap[channelID]] || 0)!.sendWS(GatewayOpcodes.VoiceStateUpdate, {
      guild_id: this.channelGuildMap[channelID] || null,
      channel_id: channelID || null,
      self_mute: options.selfMute ?? false,
      self_deaf: options.selfDeaf ?? false
    });
    if (options.opusOnly === undefined) {
      options.opusOnly = this.options.opusOnly;
    }
    return false;
  }

  /**
   * Kick a user from a guild
   * @param {string} guildID The ID of the guild
   * @param {string} userID The ID of the user
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  kickGuildMember(guildID: string, userID: string, reason?: string) {
    return this.requestHandler.request('DELETE', Endpoints.GUILD_MEMBER(guildID, userID), true, {
      reason
    });
  }

  /**
   * Leave a guild
   * @param {string} guildID The ID of the guild
   * @returns {Promise}
   */
  leaveGuild(guildID: string) {
    return this.requestHandler.request('DELETE', Endpoints.USER_GUILD('@me', guildID), true);
  }

  /**
   * Leave a thread
   * @param {string} channelID The ID of the thread channel
   * @param {string} [userID="@me"] The user ID of the user leaving
   * @returns {Promise}
   */
  leaveThread(channelID: string, userID = '@me') {
    return this.requestHandler.request('DELETE', Endpoints.THREAD_MEMBER(channelID, userID), true);
  }

  /**
   * Leaves a voice channel
   * @param {string} channelID The ID of the voice channel
   */
  leaveVoiceChannel(channelID: string) {
    if (!channelID || !this.channelGuildMap[channelID]) {
      return;
    }
    this.closeVoiceConnection(this.channelGuildMap[channelID]);
  }

  /**
   * List all application emojis for the bot user
   */
  listApplicationEmojis() {
    return this.requestHandler.request<RESTGetAPIApplicationEmojisResult>('GET', Endpoints.APPLICATION_EMOJIS(this.application!.id), true);
  }

  /** Get an application emoji
   * @param {string} emojiID The ID of the emoji
   */
  getApplicationEmoji(emojiID: string) {
    return this.requestHandler.request<RESTGetAPIApplicationEmojiResult>('GET', Endpoints.APPLICATION_EMOJI(this.application!.id, emojiID), true);
  }

  /**
   * Create an application emoji
   * @param {RESTPostAPIApplicationEmojiJSONBody} options The emoji to create
   */
  createApplicationEmoji(options: RESTPostAPIApplicationEmojiJSONBody) {
    return this.requestHandler.request<RESTPostAPIApplicationEmojiResult>('POST', Endpoints.APPLICATION_EMOJIS(this.application!.id), true, options);
  }

  /** Update an application emoji
   * @param {string} emojiID The ID of the emoji
   * @param {RESTPatchAPIApplicationEmojiJSONBody} options The emoji to update
   */
  updateApplicationEmoji(emojiID: string, options: RESTPatchAPIApplicationEmojiJSONBody) {
    return this.requestHandler.request<RESTPatchAPIApplicationEmojiResult>('PATCH', Endpoints.APPLICATION_EMOJI(this.application!.id, emojiID), true, options);
  }

  /** Delete an application emoji
   * @param {string} emojiID The ID of the emoji
   */
  deleteApplicationEmoji(emojiID: string) {
    return this.requestHandler.request('DELETE', Endpoints.APPLICATION_EMOJI(this.application!.id, emojiID), true);
  }

  /**
   * Pin a message
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message
   * @returns {Promise}
   */
  pinMessage(channelID: string, messageID: string) {
    return this.requestHandler.request('PUT', Endpoints.CHANNEL_PIN(channelID, messageID), true);
  }

  /**
   * Begin pruning a guild
   * @param {string} guildID The ID of the guild
   * @param {number} [options] The options to pass to prune members
   * @param {Boolean} [options.computePruneCount=true] Whether or not the number of pruned members should be returned. Discord discourages setting this to true for larger guilds
   * @param {number} [options.days=7] The number of days of inactivity to prune for
   * @param {Array<string>} [options.includeRoles] An array of role IDs that members must have to be considered for pruning
   * @param {string} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<Number?>} If computePruneCount was true, resolves with the number of pruned members
   */
  pruneMembers(guildID: string, options: RESTPostAPIGuildPruneJSONBody = {}, reason?: string) {
    return this.requestHandler
      .request<RESTPostAPIGuildPruneResult>('POST', Endpoints.GUILD_PRUNE(guildID), true, {
        ...options,
        reason
      })
      .then((data) => data.pruned);
  }

  /**
   * Remove a role from a guild member
   * @param {string} guildID The ID of the guild
   * @param {string} memberID The ID of the member
   * @param {string} roleID The ID of the role
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  removeGuildMemberRole(guildID: string, memberID: string, roleID: string, reason?: string) {
    return this.requestHandler.request('DELETE', Endpoints.GUILD_MEMBER_ROLE(guildID, memberID, roleID), true, {
      reason
    });
  }

  /**
   * Remove a reaction from a message
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message
   * @param {string} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @param {string} [userID="@me"] The ID of the user to remove the reaction for
   * @returns {Promise}
   */
  removeMessageReaction(channelID: string, messageID: string, reaction: string, userID?: string) {
    if (reaction === decodeURI(reaction)) {
      reaction = encodeURIComponent(reaction);
    }
    return this.requestHandler.request('DELETE', Endpoints.CHANNEL_MESSAGE_REACTION_USER(channelID, messageID, reaction, userID ?? '@me'), true);
  }

  /**
   * Remove all reactions from a message for a single emoji.
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message
   * @param {string} reaction The reaction (Unicode string if Unicode emoji, `emojiName:emojiID` if custom emoji)
   * @returns {Promise}
   */
  removeMessageReactionEmoji(channelID: string, messageID: string, reaction: string) {
    if (reaction === decodeURI(reaction)) {
      reaction = encodeURIComponent(reaction);
    }
    return this.requestHandler.request('DELETE', Endpoints.CHANNEL_MESSAGE_REACTION(channelID, messageID, reaction), true);
  }

  /**
   * Remove all reactions from a message
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message
   * @returns {Promise}
   */
  removeMessageReactions(channelID: string, messageID: string) {
    return this.requestHandler.request('DELETE', Endpoints.CHANNEL_MESSAGE_REACTIONS(channelID, messageID), true);
  }

  /**
   * Search for guild members by partial nickname/username
   * @param {string} guildID The ID of the guild
   * @param {string} query The query string to match username(s) and nickname(s) against
   * @param {number} [limit=1] The maximum number of members you want returned, capped at 100
   * @returns {Promise<Array<Member>>}
   */
  searchGuildMembers(guildID: string, query: string, limit: number = 1) {
    return this.requestHandler
      .request<RESTGetAPIGuildMembersSearchResult>('GET', Endpoints.GUILD_MEMBERS_SEARCH(guildID), true, {
        query,
        limit
      })
      .then((members) => {
        const guild = this.guilds.get(guildID);
        return members.map((member) => new Member(member, guild!));
      });
  }

  /**
   * Send typing status in a channel
   * @param {string} channelID The ID of the channel
   * @returns {Promise}
   */
  sendChannelTyping(channelID: string) {
    return this.requestHandler.request('POST', Endpoints.CHANNEL_TYPING(channelID), true);
  }

  /**
   * Force a guild template to sync
   * @param {string} guildID The ID of the guild
   * @param {string} code The template code
   * @returns {Promise<GuildTemplate>}
   */
  syncGuildTemplate(guildID: string, code: string) {
    return this.requestHandler.request<RESTPutAPIGuildTemplateSyncResult>('PUT', Endpoints.GUILD_TEMPLATE_GUILD(guildID, code), true).then((template) => new GuildTemplate(template, this));
  }

  /**
   * Unban a user from a guild
   * @param {string} guildID The ID of the guild
   * @param {string} userID The ID of the user
   * @param {string} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  unbanGuildMember(guildID: string, userID: string, reason?: string) {
    return this.requestHandler.request('DELETE', Endpoints.GUILD_BAN(guildID, userID), true, {
      reason
    });
  }

  /**
   * Unpin a message
   * @param {string} channelID The ID of the channel
   * @param {string} messageID The ID of the message
   * @returns {Promise}
   */
  unpinMessage(channelID: string, messageID: string) {
    return this.requestHandler.request('DELETE', Endpoints.CHANNEL_PIN(channelID, messageID), true);
  }

  _formatAllowedMentions(allowed?: ClientOptions['allowedMentions']): APIAllowedMentions {
    const options = allowed ?? this.options.allowedMentions;
    const result: APIAllowedMentions = {
      parse: []
    };
    if (options?.everyone) {
      result.parse!.push(AllowedMentionsTypes.Everyone);
    }
    if (options?.roles === true) {
      result.parse!.push(AllowedMentionsTypes.Role);
    } else if (Array.isArray(options?.roles)) {
      if (options?.roles.length > 100) {
        throw new Error('Allowed role mentions cannot exceed 100.');
      }
      result.roles = options?.roles;
    }
    if (options?.users === true) {
      result.parse!.push(AllowedMentionsTypes.User);
    } else if (Array.isArray(options?.users)) {
      if (options?.users.length > 100) {
        throw new Error('Allowed user mentions cannot exceed 100.');
      }
      result.users = options?.users;
    }
    if (options?.repliedUser !== undefined) {
      result.replied_user = options?.repliedUser;
    }
    return result;
  }

  _formatImage(url: string, format?: ImageFormat, size?: number) {
    if (!format || !Object.values(ImageFormat).includes(format)) {
      // @ts-expect-error -- It's ok
      format = url.includes('/a_') ? 'gif' : this.options.defaultImageFormat;
    }
    if (!size || size < 16 || size > 4096 || size & (size - 1)) {
      size = this.options.defaultImageSize;
    }
    return `${Endpoints.CDN_URL}${url}.${format}?size=${size}`;
  }

  async loadSKUs() {
    const SKUs = await this.requestHandler.request<RESTGetAPISKUsResult>('GET', Routes.skus(this.user.id), true);
    this.SKUs.clear();
    for (const sku of SKUs) {
      this.SKUs.update(sku);
    }
  }

  async getEntitlements({ userID, skuIDs, before, after, limit, guildID, hideExpired }: { userID?: string; skuIDs?: string; before?: string; after?: string; limit?: number; guildID?: string; hideExpired?: boolean }) {
    const entitlements = await this.requestHandler.request<RESTGetAPIEntitlementsResult>('GET', Routes.entitlements(this.user.id), true, {
      user_id: userID,
      sku_ids: skuIDs,
      before,
      after,
      limit,
      guild_id: guildID,
      exclude_ended: hideExpired
    });

    return entitlements.map((entitlement) => new Entitlement(entitlement, this));
  }

  tostring() {
    return `[Client ${this.user.id}]`;
  }

  toJSON(props = []) {
    return Base.prototype.toJSON.call(this, ['application', 'bot', 'channelGuildMap', 'gatewayURL', 'groupChannels', 'guilds', 'guildShardMap', 'lastConnect', 'lastReconnectDelay', 'notes', 'options', 'presence', 'privateChannelMap', 'privateChannels', 'ready', 'reconnectAttempts', 'relationships', 'requestHandler', 'shards', 'startTime', 'unavailableGuilds', 'userGuildSettings', 'users', 'userSettings', 'voiceConnections', ...props]);
  }
}

export interface ClientOptions {
  /**
   * A list of mentions to allow by default in createMessage/editMessage
   *
   * @type {AllowedMentions}
   * @memberof ClientOptions
   */
  allowedMentions?: AllowedMentions;

  /**
   * Have astri-ts autoreconnect when connection is lost
   *
   * @type {boolean}
   * @memberof ClientOptions
   */
  autoreconnect?: boolean;

  /**
   * Whether to request WebSocket data to be compressed or not
   *
   * @type {boolean}
   * @memberof ClientOptions
   */
  compress?: boolean;

  /**
   * How long in milliseconds to wait for the connection to handshake with the server
   *
   * @type {number}
   * @memberof ClientOptions
   */
  connectionTimeout?: number;

  /**
   * The default format to provide user avatars, guild icons, and group icons in.
   *
   * @type {string}
   * @memberof ClientOptions
   */
  defaultImageFormat?: ImageFormat;

  /**
   * The default size to return user avatars, guild icons, banners, splashes, and group icons. Can be any power of two between 16 and 2048. If the height and width are different, the width will be the value specified, and the height relative to that
   *
   * @type {number}
   * @memberof ClientOptions
   */
  defaultImageSize?: number;

  /**
   * If disableEvents[eventName] is true, the WS event will not be processed. This can cause significant performance increase on large bots.
   *
   * @type {{ [key in keyof typeof ApiEvents]?: boolean }}
   * @memberof ClientOptions
   */
  disableEvents?: { [key in GatewayDispatchEvents]?: boolean };

  /**
   * The ID of the first shard to run for this client
   *
   * @type {number}
   * @memberof ClientOptions
   */
  firstShardID?: number;

  /**
   * Get all the users in every guild. Ready time will be severely delayed
   *
   * @type {boolean}
   * @memberof ClientOptions
   */
  getAllUsers?: boolean;

  /**
   * How long in milliseconds to wait for a GUILD_CREATE before "ready" is fired. Increase this value if you notice missing guilds
   *
   * @type {number}
   * @memberof ClientOptions
   */
  guildCreateTimeout?: number;

  /**
   * A list of [intent names](/astri-ts/docs/reference), pre-shifted intent numbers to add, or a raw bitmask value describing the intents to subscribe to. Some intents, like `guildPresences` and `guildMembers`, must be enabled on your application's page to be used. By default, all non-privileged intents are enabled
   *
   * @type {(number | Array<number | string>)}
   * @memberof ClientOptions
   */
  intents?: number | Array<number | keyof typeof GatewayIntentBits>;

  /**
   * The maximum number of offline users per guild during initial guild data transmission
   *
   * @type {number}
   * @memberof ClientOptions
   */
  largeThreshold?: number;

  /**
   * The ID of the last shard to run for this client
   *
   * @type {number}
   * @memberof ClientOptions
   */
  lastShardID?: number;

  /**
   * The maximum amount of times that the client is allowed to try to reconnect to Discord
   *
   * @type {number}
   * @memberof ClientOptions
   */
  maxReconnectAttempts?: number;

  /**
   * The maximum amount of times a shard can attempt to resume a session before considering that session invalid
   *
   * @type {number}
   * @memberof ClientOptions
   */
  maxResumeAttempts?: number;

  /**
   * The total number of shards you want to run. If "auto" astri-ts will use Discord's recommended shard count
   *
   * @type {(number | string)}
   * @memberof ClientOptions
   */
  maxShards?: number | string;

  /**
   * Specify an array of shards to run. Mutually exclusive with firstShardID and lastShardID
   *
   * @type {number[]}
   * @memberof ClientOptions
   */
  shards?: number[];

  /**
   * The maximum size of a channel message cache
   *
   * @type {number}
   * @memberof ClientOptions
   */
  messageLimit?: number;

  /**
   * Whether to suppress the Opus encoder not found error or not
   *
   * @type {boolean}
   * @memberof ClientOptions
   */
  opusOnly?: boolean;

  /**
   * A function which returns how long the bot should wait until reconnecting to Discord
   *
   * @memberof ClientOptions
   */
  reconnectDelay?: (lastDelay: number, attempts: number) => number;

  /**
   * Options for the REST request handler
   *
   * @type {RestOptions}
   * @memberof ClientOptions
   */
  rest?: RestOptions;

  /**
   * Whether to enable getting objects over REST. Even with this option enabled, it is recommended that you check the cache first before using REST
   *
   * @type {boolean}
   * @memberof RestOptions
   */
  restMode?: boolean;

  /**
   * Whether to populate bot.voiceConnections with existing connections the bot account has during startup. Note that this will disconnect connections from other bot sessions
   *
   * @type {boolean}
   * @memberof RestOptions
   */
  seedVoiceConnections?: boolean;

  /**
   * The number of shards that can start simultaneously. If "auto" astri-ts will use Discord's recommended shard concurrency
   *
   * @type {(string | number)}
   * @memberof RestOptions
   */
  shardConcurrency?: string | number;

  /**
   *  An object of WebSocket options to pass to the shard WebSocket constructors
   *
   * @type {WebSocket.ClientOptions}
   * @memberof RestOptions
   */
  ws?: WebSocket.ClientOptions;
}

/**
 * A list of mentions to allow by default in createMessage/editMessage
 *
 * @interface AllowedMentions
 */
interface AllowedMentions {
  /**
   * Whether or not to allow @everyone/@here
   *
   * @type {boolean}
   * @memberof AllowedMentions
   */
  everyone?: boolean;

  /**
   * Whether or not to allow all role mentions, or an array of specific role mentions to allow
   *
   * @type {(boolean | string[])}
   * @memberof AllowedMentions
   */
  roles?: boolean | string[];

  /**
   * Whether or not to allow all user mentions, or an array of specific user mentions to allow
   *
   * @type {(boolean | string[])}
   * @memberof AllowedMentions
   */
  users?: boolean | string[];

  /**
   * Whether or not to mention the author of the message being replied to
   *
   * @type {boolean}
   * @memberof AllowedMentions
   */
  repliedUser?: boolean;

  parse?: string[];
}

export interface RestOptions {
  /**
   * A HTTPS Agent used to proxy requests
   *
   * @type {any}
   * @memberof RestOptions
   */
  agent?: any;

  /**
   * The base URL to use for API requests. Defaults to `/api/v${REST_VERSION}`
   *
   * @type {string}
   * @memberof RestOptions
   */
  baseURL?: string;

  /**
   * Whether to disable the built-in latency compensator or not
   *
   * @type {boolean}
   * @memberof RestOptions
   */
  disableLatencyCompensation?: boolean;

  /**
   * The domain to use for API requests
   *
   * @type {string}
   * @memberof RestOptions
   */
  domain?: string;

  /** Whether to use HTTPS or HTTP for API requests
   *
   * @type {boolean}
   * @memberof RestOptions
   */
  https?: boolean;

  /** Port to use for API requests
   *
   * @type {boolean}
   * @memberof RestOptions
   */
  port?: number;

  /**
   * The average request latency at which astri-ts will start
   *
   * @type {number}
   * @memberof RestOptions
   */
  latencyThreshold?: number;

  /**
   * A number of milliseconds to offset the ratelimit timing calculations by
   *
   * @type {number}
   * @memberof RestOptions
   */
  ratelimiterOffset?: number;

  /**
   * A number of milliseconds before REST requests are considered timed out
   *
   * @type {number}
   * @memberof RestOptions
   */
  requestTimeout?: number;
  forceQueueing?: boolean;
}
