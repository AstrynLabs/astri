'use strict';

import Base from './Base';
import ChannelFactory from '../factories/ChannelFactory';
import Endpoints from '../rest/Endpoints';
import Collection from '../util/Collection';
import Member from './Member';
import Role from './Role';
import VoiceState from './VoiceState';
import StageInstance from './StageInstance';
import ThreadChannel from './ThreadChannel';
import type {
  APIEmoji,
  APIGuild,
  APIGuildMember,
  APISticker,
  GatewayGuildCreateDispatchData,
  GatewayGuildEmojisUpdateDispatchData,
  GatewayGuildStickersUpdateDispatchData,
  GatewayPresenceUpdate,
  GatewayVoiceState,
  GuildDefaultMessageNotifications,
  GuildExplicitContentFilter,
  GuildFeature,
  GuildMFALevel,
  GuildNSFWLevel,
  GuildPremiumTier,
  GuildSystemChannelFlags,
  GuildVerificationLevel,
  ImageFormat,
  RESTAPIPartialCurrentUserGuild,
  RESTGetAPIAuditLogQuery,
  RESTGetAPIGuildBansQuery,
  RESTGetAPIGuildMembersQuery,
  RESTGetAPIGuildPruneCountQuery,
  RESTPatchAPIApplicationGuildCommandJSONBody,
  RESTPatchAPIGuildChannelPositionsJSONBody,
  RESTPatchAPIGuildEmojiJSONBody,
  RESTPatchAPIGuildJSONBody,
  RESTPatchAPIGuildMemberJSONBody,
  RESTPatchAPIGuildRoleJSONBody,
  RESTPatchAPIGuildStickerJSONBody,
  RESTPatchAPIGuildTemplateJSONBody,
  RESTPatchAPIGuildVoiceStateUserJSONBody,
  RESTPatchAPIGuildWelcomeScreenJSONBody,
  RESTPatchAPIGuildWidgetSettingsJSONBody,
  RESTPostAPIApplicationCommandsJSONBody,
  RESTPostAPIApplicationGuildCommandsJSONBody,
  RESTPostAPIGuildChannelJSONBody,
  RESTPostAPIGuildEmojiJSONBody,
  RESTPostAPIGuildPruneJSONBody,
  RESTPostAPIGuildRoleJSONBody,
  RESTPostAPIGuildStickerFormDataBody,
  RESTPutAPIApplicationCommandsJSONBody,
  RESTPutAPIApplicationGuildCommandsJSONBody,
  RESTPutAPIGuildApplicationCommandsPermissionsJSONBody
} from 'discord-api-types/v10';
import type Client from '../Client';
import type Shard from '../gateway/Shard';
import PermissionBitfield from '../util/PermissionBitfield';
import GuildChannel from './GuildChannel';

export type VoiceStateType = Omit<GatewayVoiceState, 'guild_id'> & { id: string };

/**
 * Represents a guild
 * @prop {String?} afkChannelID The ID of the AFK voice channel
 * @prop {Number} afkTimeout The AFK timeout in seconds
 * @prop {String?} applicationID The application ID of the guild creator if it is bot-created
 * @prop {Number?} approximateMemberCount The approximate number of members in the guild (REST only)
 * @prop {Number?} approximatePresenceCount The approximate number of presences in the guild (REST only)
 * @prop {Boolean?} autoRemoved Whether the guild was automatically removed from Discovery
 * @prop {String?} banner The hash of the guild banner image, or null if no banner (VIP only)
 * @prop {String?} bannerURL The URL of the guild's banner image
 * @prop {Array<Object>?} categories The guild's discovery categories
 * @prop {Collection<GuildChannel>} channels Collection of Channels in the guild
 * @prop {Number} createdAt Timestamp of the guild's creation
 * @prop {Number} defaultNotifications The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions"
 * @prop {String?} description The description for the guild (VIP only)
 * @prop {String?} discoverySplash The has of the guild discovery splash image, or null if no discovery splash
 * @prop {String?} discoverySplashURL The URL of the guild's discovery splash image
 * @prop {Number?} emojiCount The number of emojis on the guild
 * @prop {Array<Object>} emojis An array of guild emoji objects
 * @prop {Number} explicitContentFilter The explicit content filter level for the guild. 0 is off, 1 is on for people without roles, 2 is on for all
 * @prop {Array<String>} features An array of guild feature strings
 * @prop {String?} icon The hash of the guild icon, or null if no icon
 * @prop {String?} iconURL The URL of the guild's icon
 * @prop {String} id The ID of the guild
 * @prop {Number} joinedAt Timestamp of when the bot account joined the guild
 * @prop {Array<String>?} keywords The guild's discovery keywords
 * @prop {Boolean} large Whether the guild is "large" by "some Discord standard"
 * @prop {Number} mfaLevel The admin 2FA level for the guild. 0 is not required, 1 is required
 * @prop {Number?} maxMembers The maximum amount of members for the guild
 * @prop {Number} maxPresences The maximum number of people that can be online in a guild at once (returned from REST API only)
 * @prop {Number?} maxVideoChannelUsers The max number of users allowed in a video channel
 * @prop {Number} memberCount Number of members in the guild
 * @prop {Collection<Member>} members Collection of Members in the guild
 * @prop {String} name The name of the guild
 * @prop {Boolean} nsfw [DEPRECATED] Whether the guild is designated as NSFW by Discord
 * @prop {Number} nsfwLevel The guild NSFW level designated by Discord
 * @prop {String} ownerID The ID of the user that is the guild owner
 * @prop {String} preferredLocale Preferred "COMMUNITY" guild language used in server discovery and notices from Discord
 * @prop {Boolean} premiumProgressBarEnabled If the boost progress bar is enabled
 * @prop {Number?} premiumSubscriptionCount The total number of users currently boosting this guild
 * @prop {Number} premiumTier Nitro boost level of the guild
 * @prop {Object?} primaryCategory The guild's primary discovery category
 * @prop {Number?} primaryCategoryID The guild's primary discovery category ID
 * @prop {String?} publicUpdatesChannelID ID of the guild's updates channel if the guild has "COMMUNITY" features
 * @prop {Collection<Role>} roles Collection of Roles in the guild
 * @prop {String?} rulesChannelID The channel where "COMMUNITY" guilds display rules and/or guidelines
 * @prop {Shard} shard The Shard that owns the guild
 * @prop {String?} splash The hash of the guild splash image, or null if no splash (VIP only)
 * @prop {String?} splashURL The URL of the guild's splash image
 * @prop {Collection<StageInstance>} stageInstances Collection of stage instances in the guild
 * @prop {Array<Object>?} stickers An array of guild sticker objects
 * @prop {Number} systemChannelFlags The flags for the system channel
 * @prop {String?} systemChannelID The ID of the default channel for system messages (built-in join messages and boost messages)
 * @prop {Collection<ThreadChannel>} threads Collection of threads that the current user has permission to view
 * @prop {Boolean} unavailable Whether the guild is unavailable or not
 * @prop {String?} vanityURL The vanity URL of the guild (VIP only)
 * @prop {Number} verificationLevel The guild verification level
 * @prop {Collection<VoiceState>} voiceStates Collection of voice states in the guild
 * @prop {Object?} welcomeScreen The welcome screen of a Community guild, shown to new members
 * @prop {Object} welcomeScreen.description The description in the welcome screen
 * @prop {Array<Object>} welcomeScreen.welcomeChannels The list of channels in the welcome screens. Each channels have the following properties: `channelID`, `description`, `emojiID`, `emojiName`. `emojiID` and `emojiName` properties can be null.
 * @prop {Number?} widgetChannelID The channel id that the widget will generate an invite to. REST only.
 * @prop {Boolean?} widgetEnabled Whether the guild widget is enabled. REST only.
 */
export default class Guild extends Base {
  _client: Client;
  shard: Shard;
  unavailable: boolean;
  joinedAt: number;
  voiceStates = new Collection(VoiceState);
  channels = new Collection(GuildChannel);
  threads = new Collection(ThreadChannel);
  members = new Collection(Member);
  stageInstances = new Collection(StageInstance);
  roles = new Collection(Role);
  memberCount: number;
  applicationID: string | null;
  widgetEnabled?: boolean;
  widgetChannelID?: string | null;
  approximateMemberCount?: number;
  approximatePresenceCount?: number;
  ownerID: string;
  name: string;
  verificationLevel: GuildVerificationLevel;
  splash: string | null = null;
  discoverySplash: string | null = null;
  banner: string | null = null;
  icon: string | null = null;
  features: GuildFeature[] = [];
  emojis: APIEmoji[] = [];
  stickers: APISticker[] = [];
  afkChannelID: string | null = null;
  afkTimeout: number = 300;
  defaultNotifications: GuildDefaultMessageNotifications;
  mfaLevel: GuildMFALevel;
  large: boolean;
  maxPresences: number | null = null;
  explicitContentFilter: GuildExplicitContentFilter;
  systemChannelID: string | null = null;
  systemChannelFlags: GuildSystemChannelFlags;
  premiumProgressBarEnabled: boolean;
  premiumTier: GuildPremiumTier;
  premiumSubscriptionCount: number;
  vanityURL: string | null = null;
  preferredLocale: string | null = null;
  description: string | null = null;
  maxMembers: number;
  publicUpdatesChannelID: string | null = null;
  rulesChannelID: string | null = null;
  maxVideoChannelUsers: number;
  welcomeScreen: { description: string | null; welcomeChannels: Array<{ channelID: string; description: string | null; emojiID: string | null; emojiName: string | null }> };
  nsfwLevel: GuildNSFWLevel;
  constructor(data: GatewayGuildCreateDispatchData | APIGuild | RESTAPIPartialCurrentUserGuild, client: Client) {
    super(data.id);
    this._client = client;
    this.shard = client.shards.get(client.guildShardMap[this.id] || Base.getDiscordEpoch(data.id) % (client.options.maxShards ? Number(client.options.maxShards) : 0))!;
    if ('unavailable' in data) this.unavailable = !!data.unavailable;
    if ('joined_at' in data) this.joinedAt = Date.parse(data.joined_at);
    if ('member_count' in data) this.memberCount = data.member_count;

    if ('application_id' in data) this.applicationID = data.application_id;

    if ('widget_enabled' in data && data.widget_enabled !== undefined) {
      this.widgetEnabled = data.widget_enabled;
    }
    if ('widget_channel_id' in data && data.widget_channel_id !== undefined) {
      this.widgetChannelID = data.widget_channel_id;
    }

    if (data.approximate_member_count !== undefined) {
      this.approximateMemberCount = data.approximate_member_count;
    }
    if (data.approximate_presence_count !== undefined) {
      this.approximatePresenceCount = data.approximate_presence_count;
    }

    if ('roles' in data && data.roles) {
      for (const role of data.roles) {
        this.roles.add(role, this);
      }
    }

    if ('channels' in data && data.channels) {
      for (const channelData of data.channels) {
        const channel = ChannelFactory.create(channelData, client, this.id);
        if (channel.inGuild()) channel.guild = this;
        this.channels.add(channel, client);
        client.channelGuildMap[channel.id] = this.id;
      }
    }
    if ('threads' in data && data.threads) {
      for (const threadData of data.threads) {
        const channel = ChannelFactory.create(threadData, client, this.id);
        if (channel.inGuild()) channel.guild = this;
        this.threads.add(channel, client);
        client.threadGuildMap[channel.id] = this.id;
      }
    }

    if ('members' in data && data.members) {
      for (const member of data.members) {
        const payload = member as APIGuildMember & { id: string };
        payload.id = member.user.id;
        if (member.user?.id) this.members.add(payload, this);
      }
    }

    if ('stage_instances' in data && data.stage_instances) {
      for (const stageInstance of data.stage_instances) {
        stageInstance.guild_id = this.id;
        this.stageInstances.add(stageInstance, client);
      }
    }

    if ('presences' in data && data.presences) {
      for (const presence of data.presences as Array<GatewayPresenceUpdate & { id: string }>) {
        if (!this.members.get(presence.user.id)) {
          let userData = client.users.get(presence.user.id);
          if (userData) {
            userData = `{username: ${userData.username}, id: ${userData.id}, discriminator: ${userData.discriminator}}` as any;
          }
          client.emit('debug', `Presence without member. ${presence.user.id}. In global user cache: ${userData?.toString()}. ` + JSON.stringify(presence), this.shard.id);
          continue;
        }

        presence.id = presence.user.id;
        this.members.update(presence);
      }
    }

    if ('voice_states' in data && data.voice_states) {
      for (const voiceState of data.voice_states as unknown as VoiceStateType[]) {
        voiceState.id = voiceState.user_id;
        try {
          const channel = this.channels.get(voiceState.channel_id!);
          const member = this.members.update(voiceState);
          if (channel?.isVoiceBased()) {
            channel.voiceMembers.add(member);
          }
        } catch (err) {
          client.emit('error', err as Error, this.shard.id);
          continue;
        }
        if (client.options.seedVoiceConnections && voiceState.id === client.user.id) {
          process.nextTick(() => this._client.joinVoiceChannel(voiceState.channel_id!));
        }
      }
    }
    this.update(data);
  }

  update(data: GatewayGuildCreateDispatchData | APIGuild | RESTAPIPartialCurrentUserGuild | GatewayGuildEmojisUpdateDispatchData | GatewayGuildStickersUpdateDispatchData) {
    if ('name' in data && data.name !== undefined) {
      this.name = data.name;
    }
    if ('verification_level' in data && data.verification_level !== undefined) {
      this.verificationLevel = data.verification_level;
    }
    if ('splash' in data && data.splash !== undefined) {
      this.splash = data.splash;
    }
    if ('discovery_splash' in data && data.discovery_splash !== undefined) {
      this.discoverySplash = data.discovery_splash;
    }
    if ('banner' in data && data.banner !== undefined) {
      this.banner = data.banner;
    }
    if ('owner_id' in data && data.owner_id !== undefined) {
      this.ownerID = data.owner_id;
    }
    if ('icon' in data && data.icon !== undefined) {
      this.icon = data.icon;
    }
    if ('features' in data && data.features !== undefined) {
      this.features = data.features;
    }
    if ('emojis' in data && data.emojis !== undefined) {
      this.emojis = data.emojis;
    }
    if ('stickers' in data && data.stickers !== undefined) {
      this.stickers = data.stickers;
    }
    if ('afk_channel_id' in data && data.afk_channel_id !== undefined) {
      this.afkChannelID = data.afk_channel_id;
    }
    if ('afk_timeout' in data && data.afk_timeout !== undefined) {
      this.afkTimeout = data.afk_timeout;
    }
    if ('default_message_notifications' in data && data.default_message_notifications !== undefined) {
      this.defaultNotifications = data.default_message_notifications;
    }
    if ('mfa_level' in data && data.mfa_level !== undefined) {
      this.mfaLevel = data.mfa_level;
    }
    if ('large' in data && data.large !== undefined) {
      this.large = data.large;
    }
    if ('max_presences' in data && data.max_presences !== undefined) {
      this.maxPresences = data.max_presences;
    }
    if ('explicit_content_filter' in data && data.explicit_content_filter !== undefined) {
      this.explicitContentFilter = data.explicit_content_filter;
    }
    if ('system_channel_id' in data && data.system_channel_id !== undefined) {
      this.systemChannelID = data.system_channel_id;
    }
    if ('system_channel_flags' in data && data.system_channel_flags !== undefined) {
      this.systemChannelFlags = data.system_channel_flags;
    }
    if ('premium_progress_bar_enabled' in data && data.premium_progress_bar_enabled !== undefined) {
      this.premiumProgressBarEnabled = data.premium_progress_bar_enabled;
    }
    if ('premium_tier' in data && data.premium_tier !== undefined) {
      this.premiumTier = data.premium_tier;
    }
    if ('premium_subscription_count' in data && data.premium_subscription_count !== undefined) {
      this.premiumSubscriptionCount = data.premium_subscription_count;
    }
    if ('vanity_url_code' in data && data.vanity_url_code !== undefined) {
      this.vanityURL = data.vanity_url_code;
    }
    if ('preferred_locale' in data && data.preferred_locale !== undefined) {
      this.preferredLocale = data.preferred_locale;
    }
    if ('description' in data && data.description !== undefined) {
      this.description = data.description;
    }
    if ('max_members' in data && data.max_members !== undefined) {
      this.maxMembers = data.max_members;
    }
    if ('public_updates_channel_id' in data && data.public_updates_channel_id !== undefined) {
      this.publicUpdatesChannelID = data.public_updates_channel_id;
    }
    if ('rules_channel_id' in data && data.rules_channel_id !== undefined) {
      this.rulesChannelID = data.rules_channel_id;
    }
    if ('max_video_channel_users' in data && data.max_video_channel_users !== undefined) {
      this.maxVideoChannelUsers = data.max_video_channel_users;
    }
    if ('welcome_screen' in data && data.welcome_screen !== undefined) {
      this.welcomeScreen = {
        description: data.welcome_screen.description,
        welcomeChannels: data.welcome_screen.welcome_channels?.map((c) => {
          return {
            channelID: c.channel_id,
            description: c.description,
            emojiID: c.emoji_id,
            emojiName: c.emoji_name
          };
        })
      };
    }
    if ('nsfw_level' in data && data.nsfw_level !== undefined) {
      this.nsfwLevel = data.nsfw_level;
    }
  }

  get bannerURL() {
    return this.banner ? this._client._formatImage(Endpoints.BANNER(this.id, this.banner)) : null;
  }

  get iconURL() {
    return this.icon ? this._client._formatImage(Endpoints.GUILD_ICON(this.id, this.icon)) : null;
  }

  get splashURL() {
    return this.splash ? this._client._formatImage(Endpoints.GUILD_SPLASH(this.id, this.splash)) : null;
  }

  get discoverySplashURL() {
    return this.discoverySplash ? this._client._formatImage(Endpoints.GUILD_DISCOVERY_SPLASH(this.id, this.discoverySplash)) : null;
  }

  get self() {
    return this.members.get(this._client.user.id)!;
  }

  /**
   * Add a role to a guild member
   * @arg {String} memberID The ID of the member
   * @arg {String} roleID The ID of the role
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  addMemberRole(memberID: string, roleID: string, reason?: string) {
    return this._client.addGuildMemberRole(this.id, memberID, roleID, reason);
  }

  /**
   * Ban a user from the guild
   * @arg {String} userID The ID of the member
   * @arg {Number} [deleteMessageDays=0] Number of days to delete messages for, between 0-7 inclusive
   * @arg {String} [reason] Reason for the ban
   * @returns {Promise}
   */
  banMember(userID: string, deleteMessageDays: number = 0, reason?: string) {
    return this._client.banGuildMember(this.id, userID, deleteMessageDays, reason);
  }

  /**
   * Edits command permissions for a multiple commands in a guild.
   * Note: You can only add up to 10 permission overwrites for a command.
   * @arg {Array<Object>} permissions An array of [partial guild command permissions](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure)
   * @returns {Promise<Array<Object>>} Returns an array of [GuildApplicationCommandPermissions](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure) objects.
   */
  bulkEditCommandPermissions(permissions: RESTPutAPIGuildApplicationCommandsPermissionsJSONBody) {
    return this._client.bulkEditCommandPermissions(this.id, permissions);
  }

  /**
   * Bulk create/edit guild application commands
   * @arg {Array<Object>} commands An array of [Command objects](https://discord.com/developers/docs/interactions/application-commands#application-command-object)
   * @returns {Promise<Object>} Resolves with a commands object
   */
  bulkEditCommands(commands: RESTPutAPIApplicationGuildCommandsJSONBody) {
    return this._client.bulkEditGuildCommands(this.id, commands);
  }

  /**
   * Create a channel in the guild
   * @arg {String} name The name of the channel
   * @arg {Number} [type=0] The type of the channel, either 0 (text), 2 (voice), 4 (category), 5 (news) or 13 (stage)
   * @arg {Object | String} [options] The properties the channel should have. If `options` is a string, it will be treated as `options.parentID` (see below). Passing a string is deprecated and will not be supported in future versions.
   * @arg {Number} [options.bitrate] The bitrate of the channel (voice channels only)
   * @arg {Boolean} [options.nsfw] The nsfw status of the channel
   * @arg {String?} [options.parentID] The ID of the parent category channel for this channel
   * @arg {Array} [options.permissionOverwrites] An array containing permission overwrite objects
   * @arg {Number} [options.position] The sorting position of the channel
   * @arg {Number} [options.rateLimitPerUser] The time in seconds a user has to wait before sending another message (does not affect bots or users with manageMessages/manageChannel permissions) (text channels only)
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @arg {String} [options.topic] The topic of the channel (text channels only)
   * @arg {Number} [options.userLimit] The channel user limit (voice channels only)
   * @returns {Promise<CategoryChannel | TextChannel | TextVoiceChannel>}
   */
  createChannel(options: RESTPostAPIGuildChannelJSONBody, reason?: string) {
    return this._client.createChannel(this.id, options, reason);
  }

  /**
   * Create a guild application command
   * @arg {Object} command A command object
   * @arg {String} command.name The command name
   * @arg {String} [command.description] The command description (Slash Commands Only)
   * @arg {Array<Object>} [command.options] An array of [command options](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)
   * @arg {Number} [type=1] The type of application command, 1 for slash command, 2 for user, and 3 for message
   * @arg {Boolean} [command.defaultPermission] Whether the command is enabled by default when the app is added to a guild
   * @returns {Promise<Object>} Resolves with a command object
   */
  createCommand(command: RESTPostAPIApplicationGuildCommandsJSONBody) {
    return this._client.createGuildCommand(this.id, command);
  }

  /**
   * Create a emoji in the guild
   * @arg {Object} options Emoji options
   * @arg {String} options.image The base 64 encoded string
   * @arg {String} options.name The name of emoji
   * @arg {Array} [options.roles] An array containing authorized role IDs
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} A guild emoji object
   */
  createEmoji(options: RESTPostAPIGuildEmojiJSONBody, reason?: string) {
    return this._client.createGuildEmoji(this.id, options, reason);
  }

  /**
   * Create a guild role
   * @arg {Object | Role} [options] An object or Role containing the properties to set
   * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3d15b3 or 4040115)
   * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
   * @arg {String} [options.icon] The role icon as a base64 data URI
   * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
   * @arg {String} [options.name] The name of the role
   * @arg {BigInt | Number | String | Permission} [options.permissions] The role permissions
   * @arg {String} [options.unicodeEmoji] The role's unicode emoji
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Role>}
   */
  createRole(options?: RESTPostAPIGuildRoleJSONBody, reason?: string) {
    return this._client.createRole(this.id, options, reason);
  }

  /**
   * Create a guild sticker
   * @arg {Object} options Sticker options
   * @arg {String} [options.description] The description of the sticker
   * @arg {Object} options.file A file object
   * @arg {Buffer} options.file.file A buffer containing file data
   * @arg {String} options.file.name What to name the file
   * @arg {String} options.name The name of the sticker
   * @arg {String} options.tags The Discord name of a unicode emoji representing the sticker's expression
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} A sticker object
   */
  createSticker(options: RESTPostAPIGuildStickerFormDataBody, reason?: string) {
    return this._client.createGuildSticker(this.id, options, reason);
  }

  /**
   * Create a template for this guild
   * @arg {String} name The name of the template
   * @arg {String} [description] The description for the template
   * @returns {Promise<GuildTemplate>}
   */
  createTemplate(name: string, description?: string) {
    return this._client.createGuildTemplate(this.id, name, description);
  }

  /**
   * Delete the guild (bot user must be owner)
   * @returns {Promise}
   */
  delete() {
    return this._client.deleteGuild(this.id);
  }

  /**
   * Delete a guild application command
   * @arg {String} commandID The command id
   * @returns {Promise} Resolves with a promise object
   */
  deleteCommand(commandID: string) {
    return this._client.deleteGuildCommand(this.id, commandID);
  }

  /**
   * Delete a emoji in the guild
   * @arg {String} emojiID The ID of the emoji
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteEmoji(emojiID: string, reason?: string) {
    return this._client.deleteGuildEmoji(this.id, emojiID, reason);
  }

  /**
   * Delete a guild integration
   * @arg {String} integrationID The ID of the integration
   * @returns {Promise}
   */
  deleteIntegration(integrationID: string) {
    return this._client.deleteGuildIntegration(this.id, integrationID);
  }

  /**
   * Delete a role
   * @arg {String} roleID The ID of the role
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteRole(roleID: string, reason?: string) {
    return this._client.deleteRole(this.id, roleID, reason);
  }

  /**
   * Delete a guild sticker
   * @arg {String} stickerID The ID of the sticker
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  deleteSticker(stickerID: string, reason?: string) {
    return this._client.deleteGuildSticker(this.id, stickerID, reason);
  }

  /**
   * Delete a guild template
   * @arg {String} code The template code
   * @returns {Promise<GuildTemplate>}
   */
  deleteTemplate(code: string) {
    return this._client.deleteGuildTemplate(this.id, code);
  }

  /**
   * Get the guild's banner with the given format and size
   * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
   * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
   * @returns {String?}
   */
  dynamicBannerURL(format?: ImageFormat, size?: number) {
    return this.banner ? this._client._formatImage(Endpoints.BANNER(this.id, this.banner), format, size) : null;
  }

  /**
   * Get the guild's discovery splash with the given format and size
   * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
   * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
   * @returns {String?}
   */
  dynamicDiscoverySplashURL(format?: ImageFormat, size?: number) {
    return this.discoverySplash ? this._client._formatImage(Endpoints.GUILD_DISCOVERY_SPLASH(this.id, this.discoverySplash), format, size) : null;
  }

  /**
   * Get the guild's icon with the given format and size
   * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
   * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
   * @returns {String?}
   */
  dynamicIconURL(format?: ImageFormat, size?: number) {
    return this.icon ? this._client._formatImage(Endpoints.GUILD_ICON(this.id, this.icon), format, size) : null;
  }

  /**
   * Get the guild's splash with the given format and size
   * @arg {String} [format] The filetype of the icon ("jpg", "jpeg", "png", "gif", or "webp")
   * @arg {Number} [size] The size of the icon (any power of two between 16 and 4096)
   * @returns {String?}
   */
  dynamicSplashURL(format?: ImageFormat, size?: number) {
    return this.splash ? this._client._formatImage(Endpoints.GUILD_SPLASH(this.id, this.splash), format, size) : null;
  }

  /**
   * Edit the guild
   * @arg {Object} options The properties to edit
   * @arg {String} [options.afkChannelID] The ID of the AFK voice channel
   * @arg {Number} [options.afkTimeout] The AFK timeout in seconds
   * @arg {String} [options.banner] The guild banner image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
   * @arg {Number} [options.defaultNotifications] The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions".
   * @arg {String} [options.description] The description for the guild (VIP only)
   * @arg {String} [options.discoverySplash] The guild discovery splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
   * @arg {Number} [options.explicitContentFilter] The level of the explicit content filter for messages/images in the guild. 0 disables message scanning, 1 enables scanning the messages of members without roles, 2 enables scanning for all messages.
   * @arg {Array<String>} [options.features] The enabled features for the guild. Note that only certain features can be toggled with the API
   * @arg {String} [options.icon] The guild icon as a base64 data URI. Note: base64 strings alone are not base64 data URI strings
   * @arg {String} [options.name] The name of the guild
   * @arg {String} [options.ownerID] The ID of the member to transfer guild ownership to (bot user must be owner)
   * @arg {String} [options.preferredLocale] Preferred "COMMUNITY" guild language used in server discovery and notices from Discord
   * @arg {String} [options.publicUpdatesChannelID] The id of the channel where admins and moderators of "COMMUNITY" guilds receive notices from Discord
   * @arg {String} [options.rulesChannelID] The id of the channel where "COMMUNITY" guilds display rules and/or guidelines
   * @arg {String} [options.splash] The guild splash image as a base64 data URI (VIP only). Note: base64 strings alone are not base64 data URI strings
   * @arg {Number} [options.systemChannelFlags] The flags for the system channel
   * @arg {String} [options.systemChannelID] The ID of the system channel
   * @arg {Number} [options.verificationLevel] The guild verification level
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Guild>}
   */
  edit(options: RESTPatchAPIGuildJSONBody, reason?: string) {
    return this._client.editGuild(this.id, options, reason);
  }

  /**
   * Edit multiple channels' positions. Note that channel position numbers are grouped by type (category, text, voice), then sorted in ascending order (lowest number is on top).
   * @arg {Array<Object>} channelPositions An array of [ChannelPosition](https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions)
   * @arg {String} channelPositions[].id The ID of the channel
   * @arg {Number} channelPositions[].position The new position of the channel
   * @arg {Boolean} [channelPositions[].lockPermissions] Whether to sync the channel's permissions with the new parent, if changing parents
   * @arg {String} [channelPositions[].parentID] The new parent ID (category channel) for the channel that is moved. For each request, only one channel can change parents
   * @returns {Promise}
   */
  editChannelPositions(channelPositions: RESTPatchAPIGuildChannelPositionsJSONBody) {
    return this._client.editChannelPositions(this.id, channelPositions);
  }

  /**
   * Edit a guild application command
   * @arg {String} commandID The command id
   * @arg {Object} command A command object
   * @arg {String} command.name The command name
   * @arg {String} [command.description] The command description (Slash Commands Only)
   * @arg {Array<Object>} [command.options] An array of [command options](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)
   * @arg {Boolean} [command.defaultPermission] Whether the command is enabled by default when the app is added to a guild
   * @returns {Promise<Object>} Resolves with a command object
   */
  editCommand(commandID: string, commands: RESTPatchAPIApplicationGuildCommandJSONBody) {
    return this._client.editGuildCommand(this.id, commandID, commands);
  }

  /**
   * Edits command permissions for a specific command in a guild.
   * Note: You can only add up to 10 permission overwrites for a command.
   * @arg {String} commandID The command id
   * @arg {Array<Object>} permissions An array of [permissions objects](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure)
   * @returns {Promise<Object>} Resolves with a [GuildApplicationCommandPermissions](https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure) object.
   */
  editCommandPermissions(commandID: string, permissions: RESTPutAPIGuildApplicationCommandsPermissionsJSONBody) {
    return this._client.editCommandPermissions(this.id, commandID, permissions);
  }

  /**
   * Edit a emoji in the guild
   * @arg {String} emojiID The ID of the emoji you want to modify
   * @arg {Object} options Emoji options
   * @arg {String} [options.name] The name of emoji
   * @arg {Array} [options.roles] An array containing authorized role IDs
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} A guild emoji object
   */
  editEmoji(emojiID: string, options: RESTPatchAPIGuildEmojiJSONBody, reason?: string) {
    return this._client.editGuildEmoji(this.id, emojiID, options, reason);
  }

  /**
   * Edit a guild member
   * @arg {String} memberID The ID of the member (use "@me" to edit the current bot user)
   * @arg {Object} options The properties to edit
   * @arg {String?} [options.channelID] The ID of the voice channel to move the member to (must be in voice). Set to `null` to disconnect the member
   * @arg {Date?} [options.communicationDisabledUntil] When the user's timeout should expire. Set to `null` to instantly remove timeout
   * @arg {Boolean} [options.deaf] Server deafen the member
   * @arg {Boolean} [options.mute] Server mute the member
   * @arg {String} [options.nick] Set the member's guild nickname, "" to remove
   * @arg {Array<String>} [options.roles] The array of role IDs the member should have
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Member>}
   */
  editMember(memberID: string, options: RESTPatchAPIGuildMemberJSONBody, reason?: string) {
    return this._client.editGuildMember(this.id, memberID, options, reason);
  }

  /**
   * Edit the guild role
   * @arg {String} roleID The ID of the role
   * @arg {Object} options The properties to edit
   * @arg {Number} [options.color] The hex color of the role, in number form (ex: 0x3da5b3 or 4040115)
   * @arg {Boolean} [options.hoist] Whether to hoist the role in the user list or not
   * @arg {String} [options.icon] The role icon as a base64 data URI
   * @arg {Boolean} [options.mentionable] Whether the role is mentionable or not
   * @arg {String} [options.name] The name of the role
   * @arg {BigInt | Number | String | Permission} [options.permissions] The role permissions
   * @arg {String} [options.unicodeEmoji] The role's unicode emoji
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Role>}
   */
  editRole(roleID: string, options: RESTPatchAPIGuildRoleJSONBody, reason?: string) {
    return this._client.editRole(this.id, roleID, options, reason);
  }

  /**
   * Edit a guild sticker
   * @arg {String} stickerID The ID of the sticker
   * @arg {Object} options The properties to edit
   * @arg {String} [options.description] The description of the sticker
   * @arg {String} [options.name] The name of the sticker
   * @arg {String} [options.tags] The Discord name of a unicode emoji representing the sticker's expression
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise<Object>} A sticker object
   */
  editSticker(stickerID: string, options: RESTPatchAPIGuildStickerJSONBody, reason?: string) {
    return this._client.editGuildSticker(this.id, stickerID, options, reason);
  }

  /**
   * Edit a guild template
   * @arg {String} code The template code
   * @arg {Object} options The properties to edit
   * @arg {String} [options.name] The name of the template
   * @arg {String?} [options.description] The desription for the template. Set to `null` to remove the description
   * @returns {Promise<GuildTemplate>}
   */
  editTemplate(code: string, options: RESTPatchAPIGuildTemplateJSONBody) {
    return this._client.editGuildTemplate(this.id, code, options);
  }

  /**
   * Modify the guild's vanity code
   * @arg {String?} code The new vanity code
   * @returns {Promise<Object>}
   */
  editVanity(code: string) {
    return this._client.editGuildVanity(this.id, code);
  }

  /**
   * Update a user's voice state - See [caveats](https://discord.com/developers/docs/resources/guild#modify-user-voice-state-caveats)
   * @arg {Object} options The properties to edit
   * @arg {String} options.channelID The ID of the channel the user is currently in
   * @arg {Date?} [options.requestToSpeakTimestamp] Sets the user's request to speak - this can only be used when the `userID` param is "@me"
   * @arg {Boolean} [options.suppress] Toggles the user's suppress state
   * @arg {String} [userID="@me"] The user ID of the user to update
   * @returns {Promise}
   */
  editVoiceState(options: RESTPatchAPIGuildVoiceStateUserJSONBody, userID?: string) {
    return this._client.editGuildVoiceState(this.id, options, userID);
  }

  /**
   * Edit the guild welcome screen
   * @arg {Object} [options] The properties to edit
   * @arg {String?} [options.description] The description in the welcome screen
   * @arg {Boolean} [options.enabled] Whether the welcome screen is enabled
   * @arg {Array<Object>} [options.welcomeChannels] The list of channels in the welcome screen as an array
   * @arg {String} options.welcomeChannels[].channelID The channel ID of the welcome channel
   * @arg {String} options.welcomeChannels[].description The description of the welcome channel
   * @arg {String?} options.welcomeChannels[].emojiID The emoji ID of the welcome channel
   * @arg {String?} options.welcomeChannels[].emojiName The emoji name of the welcome channel
   * @returns {Promise<Object>}
   */
  editWelcomeScreen(options: RESTPatchAPIGuildWelcomeScreenJSONBody) {
    return this._client.editGuildWelcomeScreen(this.id, options);
  }

  /**
   * Modify a guild's widget
   * @arg {Object} options The widget object to modify (https://discord.com/developers/docs/resources/guild#modify-guild-widget)
   * @returns {Promise<Object>} A guild widget object
   */
  editWidget(options: RESTPatchAPIGuildWidgetSettingsJSONBody) {
    return this._client.editGuildWidget(this.id, options);
  }

  /**
   * Request all guild members from Discord
   * @arg {Number} [timeout] The number of milliseconds to wait before resolving early. Defaults to the `requestTimeout` client option
   * @returns {Promise<Number>} Resolves with the total number of fetched members.
   */
  fetchAllMembers(timeout?: number) {
    return this.fetchMembers({
      timeout
    }).then((m) => m.length);
  }

  /**
   * Request specific guild members through the gateway connection
   * @arg {Object} [options] Options for fetching the members
   * @arg {Number} [options.limit] The maximum number of members to fetch
   * @arg {Boolean} [options.presences] Whether to request member presences or not. When using intents, the `GUILD_PRESENCES` intent is required.
   * @arg {String} [options.query] The query used for looking up the members. When using intents, `GUILD_MEMBERS` is required to fetch all members.
   * @arg {Number} [options.timeout] The number of milliseconds to wait before resolving early. Defaults to the `requestTimeout` client option
   * @arg {Array<String>} [options.userIDs] The IDs of members to fetch
   * @returns {Promise<Array<Member>>} Resolves with the fetched members.
   */
  fetchMembers(options: { limit?: number; presences?: boolean; query?: string; timeout?: number }) {
    return this.shard.requestGuildMembers({
      guild_id: this.id,
      limit: options.limit ?? 0,
      presences: options.presences ?? false,
      query: options.query ?? ''
    });
  }

  /**
   * Get all active threads in this guild
   * @returns {Promise<Object>} An object containing an array of `threads` and an array of `members`
   */
  getActiveThreads() {
    return this._client.getActiveGuildThreads(this.id);
  }

  /**
   * Get the audit log for the guild
   * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @arg {Number} [options.actionType] Filter entries by action type
   * @arg {String} [options.before] Get entries before this entry ID
   * @arg {Number} [options.limit=50] The maximum number of entries to return
   * @arg {String} [options.userID] Filter entries by the user that performed the action
   * @returns {Promise<{entries: Array<GuildAuditLogEntry>, integrations: Array<PartialIntegration>, threads: Array<NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel>, users: Array<User>, webhooks: Array<Webhook>}>}
   */
  getAuditLog(options: RESTGetAPIAuditLogQuery) {
    return this._client.getGuildAuditLog(this.id, options);
  }

  /**
   * Get a ban from the ban list of a guild
   * @arg {String} userID The ID of the banned user
   * @returns {Promise<Object>} Resolves with {reason: String, user: User}
   */
  getBan(userID: string) {
    return this._client.getGuildBan(this.id, userID);
  }

  /**
   * Get the ban list of the guild
   * @arg {Object} [options] Options for the request
   * @arg {String} [options.after] Only get users after given user ID
   * @arg {String} [options.before] Only get users before given user ID
   * @arg {Number} [options.limit=1000] The maximum number of users to return
   * @returns {Promise<Array<Object>>} Resolves with an array of { reason: String, user: User }
   */
  getBans(options: RESTGetAPIGuildBansQuery) {
    return this._client.getGuildBans(this.id, options);
  }

  /**
   * Get a guild application command
   * @arg {String} commandID The command id
   * @returns {Promise<Object>} Resolves with a command object
   */
  getCommand(commandID: string) {
    return this._client.getGuildCommand(this.id, commandID);
  }

  /**
   * Get the a guild's application command permissions
   * @arg {String} commandID The command id
   * @returns {Promise<Object>} Resolves with a guild application command permissions object.
   */
  getCommandPermissions(commandID: string) {
    return this._client.getCommandPermissions(this.id, commandID);
  }

  /**
   * Get the guild's application commands
   * @returns {Promise<Array<Object>>} Resolves with an array of command objects
   */
  getCommands() {
    return this._client.getGuildCommands(this.id);
  }

  /**
   * Get the all of a guild's application command permissions
   * @returns {Promise<Array<Object>>} Resolves with an array of guild application command permissions objects.
   */
  getGuildCommandPermissions() {
    return this._client.getGuildCommandPermissions(this.id);
  }

  /**
   * Get a list of integrations for the guild
   * @returns {Promise<Array<GuildIntegration>>}
   */
  getIntegrations() {
    return this._client.getGuildIntegrations(this.id);
  }

  /**
   * Get all invites in the guild
   * @returns {Promise<Array<Invite>>}
   */
  getInvites() {
    return this._client.getGuildInvites(this.id);
  }

  /**
   * Get the prune count for the guild
   * @arg {Number} [options] The options to use to get number of prune members
   * @arg {Number} [options.days=7] The number of days of inactivity to prune for
   * @arg {Array<String>} [options.includeRoles] An array of role IDs that members must have to be considered for pruning
   * @returns {Promise<Number>} Resolves with the number of members that would be pruned
   */
  getPruneCount(options?: RESTGetAPIGuildPruneCountQuery) {
    return this._client.getPruneCount(this.id, options);
  }

  /**
   * Get a guild's channels via the REST API. REST mode is required to use this endpoint.
   * @returns {Promise<Array<CategoryChannel> | Array<TextChannel> | Array<TextVoiceChannel>>}
   */
  getRESTChannels() {
    return this._client.getRESTGuildChannels(this.id);
  }

  /**
   * Get a guild emoji via the REST API. REST mode is required to use this endpoint.
   * @arg {String} emojiID The ID of the emoji
   * @returns {Promise<Object>} An emoji object
   */
  getRESTEmoji(emojiID: string) {
    return this._client.getRESTGuildEmoji(this.id, emojiID);
  }

  /**
   * Get a guild's emojis via the REST API. REST mode is required to use this endpoint.
   * @returns {Promise<Array<Object>>} An array of guild emoji objects
   */
  getRESTEmojis() {
    return this._client.getRESTGuildEmojis(this.id);
  }

  /**
   * Get a guild's members via the REST API. REST mode is required to use this endpoint.
   * @arg {String} memberID The ID of the member
   * @returns {Promise<Member>}
   */
  getRESTMember(memberID: string) {
    return this._client.getRESTGuildMember(this.id, memberID);
  }

  /**
   * Get a guild's members via the REST API. REST mode is required to use this endpoint.
   * @arg {Object} [options] Options for the request. If this is a number ([DEPRECATED] behavior), it is treated as `options.limit`
   * @arg {String} [options.after] The highest user ID of the previous page
   * @arg {Number} [options.limit=1] The max number of members to get (1 to 1000)
   * @arg {String} [after] [DEPRECATED] The highest user ID of the previous page
   * @returns {Promise<Array<Member>>}
   */
  getRESTMembers(options?: RESTGetAPIGuildMembersQuery) {
    return this._client.getRESTGuildMembers(this.id, options);
  }

  /**
   * Get a guild's roles via the REST API. REST mode is required to use this endpoint.
   * @returns {Promise<Array<Role>>}
   */
  getRESTRoles() {
    return this._client.getRESTGuildRoles(this.id);
  }

  /**
   * Get a guild sticker via the REST API. REST mode is required to use this endpoint.
   * @arg {String} stickerID The ID of the sticker
   * @returns {Promise<Object>} A sticker object
   */
  getRESTSticker(stickerID: string) {
    return this._client.getRESTGuildSticker(this.id, stickerID);
  }

  /**
   * Get a guild's stickers via the REST API. REST mode is required to use this endpoint.
   * @returns {Promise<Array<Object>>} An array of guild sticker objects
   */
  getRESTStickers() {
    return this._client.getRESTGuildStickers(this.id);
  }

  /**
   * Get the guild's templates
   * @returns {Promise<Array<GuildTemplate>>}
   */
  getTemplates() {
    return this._client.getGuildTemplates(this.id);
  }

  /**
   * Returns the vanity url of the guild
   * @returns {Promise}
   */
  getVanity() {
    return this._client.getGuildVanity(this.id);
  }

  /**
   * Get possible voice regions for a guild
   * @returns {Promise<Array<Object>>} Resolves with an array of voice region objects
   */
  getVoiceRegions() {
    return this._client.getVoiceRegions(this.id);
  }

  /**
   * Get all the webhooks in the guild
   * @returns {Promise<Array<Object>>} Resolves with an array of webhook objects
   */
  getWebhooks() {
    return this._client.getGuildWebhooks(this.id);
  }

  /**
   * Get the welcome screen of the Community guild, shown to new members
   * @returns {Promise<Object>}
   */
  getWelcomeScreen() {
    return this._client.getGuildWelcomeScreen(this.id);
  }

  /**
   * Get a guild's widget object
   * @returns {Promise<Object>} A guild widget object
   */
  getWidget() {
    return this._client.getGuildWidget(this.id);
  }

  /**
   * Get a guild's widget settings object
   * @returns {Promise<Object>} A guild widget settings object
   */
  getWidgetSettings() {
    return this._client.getGuildWidgetSettings(this.id);
  }

  /**
   * Kick a member from the guild
   * @arg {String} userID The ID of the member
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  kickMember(userID: string, reason?: string) {
    return this._client.kickGuildMember(this.id, userID, reason);
  }

  /**
   * Leave the guild
   * @returns {Promise}
   */
  leave() {
    return this._client.leaveGuild(this.id);
  }

  /**
   * Leaves the voice channel in this guild
   */
  leaveVoiceChannel() {
    this._client.closeVoiceConnection(this.id);
  }

  /**
   * Get the guild permissions of a member
   * @arg {String | Member | Object} memberID The ID of the member or a Member object
   * @returns {Permission}
   */
  permissionsOf(memberID: string | Member): PermissionBitfield {
    const member = memberID instanceof Member ? memberID : this.members.get(memberID)!;
    if (member.id === this.ownerID) {
      return new PermissionBitfield(PermissionBitfield.all);
    } else {
      const permissions = this.roles.get(this.id)!.permissions;
      if (permissions?.isAdmin()) return new PermissionBitfield(PermissionBitfield.all);

      const calculated = new PermissionBitfield(permissions?.bits);

      for (const roleID of member.roles) {
        const role = this.roles.get(roleID);
        if (!role) {
          continue;
        }

        if (!role.permissions) continue;
        if (role.permissions.isAdmin()) {
          calculated.add(PermissionBitfield.all);
          break;
        } else {
          calculated.add(role.permissions.bits);
        }
      }
      return calculated;
    }
  }

  /**
   * Begin pruning the guild
   * @arg {Number} [options] The options to pass to prune members
   * @arg {Boolean} [options.computePruneCount=true] Whether or not the number of pruned members should be returned. Discord discourages setting this to true for larger guilds
   * @arg {Number} [options.days=7] The number of days of inactivity to prune for
   * @arg {Array<String>} [options.includeRoles] An array of role IDs that members must have to be considered for pruning
   * @arg {String} [options.reason] The reason to be displayed in audit logs
   * @returns {Promise<Number>} Resolves with the number of pruned members
   */
  pruneMembers(options: RESTPostAPIGuildPruneJSONBody, reason?: string) {
    return this._client.pruneMembers(this.id, options, reason);
  }

  /**
   * Remove a role from a guild member
   * @arg {String} memberID The ID of the member
   * @arg {String} roleID The ID of the role
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  removeMemberRole(memberID: string, roleID: string, reason?: string) {
    return this._client.removeGuildMemberRole(this.id, memberID, roleID, reason);
  }

  /**
   * Search for guild members by partial nickname/username
   * @arg {String} query The query string to match username(s) and nickname(s) against
   * @arg {Number} [limit=1] The maximum number of members you want returned, capped at 100
   * @returns {Promise<Array<Member>>}
   */
  searchMembers(query: string, limit?: number) {
    return this._client.searchGuildMembers(this.id, query, limit);
  }

  /**
   * Force a guild template to sync
   * @arg {String} code The template code
   * @returns {Promise<GuildTemplate>}
   */
  syncTemplate(code: string) {
    return this._client.syncGuildTemplate(this.id, code);
  }

  /**
   * Unban a user from the guild
   * @arg {String} userID The ID of the member
   * @arg {String} [reason] The reason to be displayed in audit logs
   * @returns {Promise}
   */
  unbanMember(userID: string, reason?: string) {
    return this._client.unbanGuildMember(this.id, userID, reason);
  }

  toJSON(props = []) {
    return super.toJSON([
      'afkChannelID',
      'afkTimeout',
      'applicationID',
      'approximateMemberCount',
      'approximatePresenceCount',
      'autoRemoved',
      'banner',
      'categories',
      'channels',
      'defaultNotifications',
      'description',
      'discoverySplash',
      'emojiCount',
      'emojis',
      'explicitContentFilter',
      'features',
      'icon',
      'joinedAt',
      'keywords',
      'large',
      'maxMembers',
      'maxPresences',
      'maxVideoChannelUsers',
      'memberCount',
      'members',
      'mfaLevel',
      'name',
      'ownerID',
      'pendingVoiceStates',
      'preferredLocale',
      'premiumProgressBarEnabled',
      'premiumSubscriptionCount',
      'premiumTier',
      'primaryCategory',
      'primaryCategoryID',
      'publicUpdatesChannelID',
      'roles',
      'rulesChannelID',
      'splash',
      'stickers',
      'systemChannelFlags',
      'systemChannelID',
      'unavailable',
      'vanityURL',
      'verificationLevel',
      'voiceStates',
      'welcomeScreen',
      'widgetChannelID',
      'widgetEnabled',
      ...props
    ]);
  }
}
