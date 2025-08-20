'use strict';

import util from 'util';
import Base from '../structures/Base';
import Bucket from '../util/Bucket';
import type BaseChannel from '../structures/BaseChannel';
import GuildChannel from '../structures/GuildChannel';
import Message from '../structures/Message';
import PrivateChannel from '../structures/PrivateChannel';
import User from '../structures/User';
import Invite from '../structures/Invite';
import StageInstance from '../structures/StageInstance';
import GuildAuditLogEntry from '../structures/GuildAuditLogEntry';
import EventEmitter from 'eventemitter3';
import type Client from '../Client';
import { ChannelType, GatewayDispatchEvents, GatewayIntentBits, GatewayOpcodes, GatewayVersion, PresenceUpdateStatus } from 'discord-api-types/v10';
import type { APIGuild, APIGuildMember, APIUnavailableGuild, GatewayActivity, GatewayCloseCodes, GatewayDispatchPayload, GatewayGuildMemberAddDispatchData, GatewayGuildMemberUpdateDispatchData, GatewayIdentifyData, GatewayReceivePayload, GatewayRequestGuildMembersDataWithQuery, GatewayRequestGuildMembersDataWithUserIds, GatewayThreadMemberUpdateDispatchData, GatewayVoiceState } from 'discord-api-types/v10';
import { type RawData, WebSocket } from 'ws';
import type Member from '../structures/Member';
import ChannelFactory from '../factories/ChannelFactory';
import InteractionFactory from '../factories/InteractionFactory';
import type Events from '../interfaces/Events';
import { type UncachedMessage } from '../interfaces/Events';
import PartialUser from '../structures/PartialUser';
import type PartialChannel from '../structures/PartialChannel';
import Entitlement from '../structures/Entitlement';
import ZlibHelper from '../util/Zlib';
import Subscription from '../structures/Subscription';

/**
 * Represents a shard
 * @extends EventEmitter
 * @prop {Number} id The ID of the shard
 * @prop {Boolean} connecting Whether the shard is connecting
 * @prop {Array<String>?} discordServerTrace Debug trace of Discord servers
 * @prop {Number} lastHeartbeatReceived Last time Discord acknowledged a heartbeat, null if shard has not sent heartbeat yet
 * @prop {Number} lastHeartbeatSent Last time shard sent a heartbeat, null if shard has not sent heartbeat yet
 * @prop {Number} latency The current latency between the shard and Discord, in milliseconds
 * @prop {Boolean} ready Whether the shard is ready
 * @prop {String} status The status of the shard. "disconnected"/"connecting"/"handshaking"/"ready"/"identifying"/"resuming"
 */
export default class Shard extends EventEmitter<Events> {
  id: number;
  client: Client;
  ready: boolean = false;
  guildSyncQueue: string[] = [];
  guildSyncQueueLength: number = 1;
  unsyncedGuilds = 0;
  getAllUsersQueue: string[] = [];
  getAllUsersLength = 1;
  getAllUsersCount: Record<string, unknown> = {};
  ws: WebSocket | null;
  status: 'disconnected' | 'connecting' | 'handshaking' | 'ready' | 'identifying' | 'resuming';
  connectAttempts = 0;
  connecting = false;
  heartbeatInterval: NodeJS.Timeout | null = null;
  sessionID: string | null = null;
  resumeURL: string | null = null;
  reconnectInterval: number;
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
  seq: number;
  guildCreateTimeout: NodeJS.Timeout | null;
  globalBucket: Bucket;
  presenceUpdateBucket: Bucket;
  lastHeartbeatAck = false;
  lastHeartbeatSent: number | null = null;
  lastHeartbeatReceived: number | null = null;
  _token: string;
  connectTimeout: NodeJS.Timeout | null;
  discordServerTrace?: string;
  latency: number;
  requestMembersPromise: Record<string, { resolve: (members: Array<APIGuildMember | Member>) => void; received: number; members: Array<APIGuildMember | Member>; timeout: NodeJS.Timeout }> = {};
  preReady = false;
  zlib?: ZlibHelper;
  constructor(id: number, client: Client) {
    super();

    this.id = id;
    this.client = client;

    this.onPacket = this.onPacket.bind(this);
    this._onWSOpen = this._onWSOpen.bind(this);
    this._onWSMessage = this._onWSMessage.bind(this);
    this._onWSError = this._onWSError.bind(this);
    this._onWSClose = this._onWSClose.bind(this);

    this.hardReset();
  }

  update(...args: any) {}
  readonly createdAt = 0;

  checkReady() {
    if (!this.ready) {
      if (this.guildSyncQueue.length > 0) {
        // this.requestGuildSync(this.guildSyncQueue);
        this.guildSyncQueue = [];
        this.guildSyncQueueLength = 1;
        return;
      }
      if (this.unsyncedGuilds > 0) {
        return;
      }
      if (this.getAllUsersQueue.length > 0) {
        for (const ID of this.getAllUsersQueue) {
          void this.requestGuildMembers({ guild_id: ID, limit: 0, query: '' });
        }
        this.getAllUsersQueue = [];
        this.getAllUsersLength = 1;
        return;
      }
      if (Object.keys(this.getAllUsersCount).length === 0) {
        this.ready = true;
        /**
         * Fired when the shard turns ready
         * @event Shard#ready
         */
        super.emit('ready');
      }
    }
  }

  /**
   * Tells the shard to connect
   */
  connect() {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.emit('error', new Error('Existing connection detected'), this.id);
      return;
    }
    ++this.connectAttempts;
    this.connecting = true;
    return this.initializeWS();
  }

  createGuild(_guild: APIGuild | APIUnavailableGuild) {
    this.client.guildShardMap[_guild.id] = this.id;
    const guild = this.client.guilds.add(_guild, this.client, true);
    // if (!this.client.bot) {
    //   ++this.unsyncedGuilds;
    //   this.syncGuild(guild.id);
    // }
    if (this.client.options.getAllUsers && guild.members.size < guild.memberCount) {
      this.getGuildMembers({
        guildID: guild.id,
        presences: this.client.intents?.has(GatewayIntentBits.GuildPresences) ?? false
      });
    }
    return guild;
  }

  /**
   * Disconnects the shard
   * @arg {Object?} [options] Shard disconnect options
   * @arg {String | Boolean} [options.reconnect] false means destroy everything, true means you want to reconnect in the future, "auto" will autoreconnect
   * @arg {Error} [error] The error that causes the disconnect
   */
  disconnect(options: { reconnect?: boolean | 'auto' } = {}, error?: Error | null) {
    if (!this.ws) {
      return;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.removeListener('message', this._onWSMessage.bind(this));
      this.ws.removeListener('close', this._onWSClose.bind(this));
      try {
        if (options.reconnect && this.sessionID) {
          if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.close(4901, 'astri: reconnect');
          } else {
            this.emit('debug', `Terminating websocket (state: ${this.ws.readyState})`, this.id);
            this.ws.terminate();
          }
        } else {
          this.ws.close(1000, 'astri: normal');
        }
      } catch (err) {
        this.emit('error', err as Error, this.id);
      }
    }
    this.ws = null;
    this.reset();

    if (error) {
      this.emit('error', error, this.id);
    }

    /**
     * Fired when the shard disconnects
     * @event Shard#disconnect
     * @prop {Error?} err The error, if any
     */
    super.emit('disconnect', error);

    if (this.sessionID && this.connectAttempts >= (this.client.options.maxResumeAttempts ?? Infinity)) {
      this.emit('debug', `Automatically invalidating session due to excessive resume attempts | Attempt ${this.connectAttempts}`, this.id);
      this.sessionID = null;
      this.resumeURL = null;
    }

    if (options.reconnect === 'auto' && this.client.options.autoreconnect) {
      /**
       * Fired when stuff happens and gives more info
       * @event Client#debug
       * @prop {String} message The debug message
       * @prop {Number} id The ID of the shard
       */
      if (this.sessionID) {
        this.emit('debug', `Immediately reconnecting for potential resume | Attempt ${this.connectAttempts}`, this.id);
        this.client.shards.connect(this);
      } else {
        this.emit('debug', `Queueing reconnect in ${this.reconnectInterval}ms | Attempt ${this.connectAttempts}`, this.id);
        setTimeout(() => {
          this.client.shards.connect(this);
        }, this.reconnectInterval);
        this.reconnectInterval = Math.min(Math.round(this.reconnectInterval * (Math.random() * 2 + 1)), 30000);
      }
    } else if (!options.reconnect) {
      this.hardReset();
    }
  }

  /**
   * Update the bot's AFK status.
   * @arg {Boolean} afk Whether the bot user is AFK or not
   */
  editAFK(afk: boolean) {
    this.presence.afk = !!afk;

    this.sendPresenceUpdate();
  }

  /**
   * Updates the bot's status on all guilds the shard is in
   * @arg {String} [status] Sets the bot's status, either "online", "idle", "dnd", or "invisible"
   * @arg {Array | Object} [activities] Sets the bot's activities. A single activity object is also accepted for backwards compatibility
   * @arg {String} activities[].name The name of the activity
   * @arg {Number} activities[].type The type of the activity. 0 is playing, 1 is streaming (Twitch only), 2 is listening, 3 is watching, 5 is competing in
   * @arg {String} [activities[].url] The URL of the activity
   */
  setPresence(status: PresenceUpdateStatus, activities: Array<Omit<GatewayActivity, 'id' | 'created_at'>>) {
    this.presence.status = status;
    this.presence.activities = activities;

    this.sendPresenceUpdate();
  }

  emit<T extends EventEmitter.EventNames<Events>>(event: T, ...args: EventEmitter.EventArgs<Events, T>) {
    let emitted = false;
    emitted = this.client.emit(event, ...args);
    if (!event.startsWith('raw')) this.client.emit('event', event, ...args);
    if (event !== 'error' || this.listeners('error').length > 0) {
      super.emit(event, ...args);
    }
    return emitted;
  }

  // TODO: Test to make sure this actually works
  getGuildMembers({ guildID, timeout, presences }: { guildID: string; timeout?: number; presences?: boolean }) {
    if (this.getAllUsersCount[guildID]) {
      throw new Error('Cannot request all members while an existing request is processing');
    }
    this.getAllUsersCount[guildID] = true;
    // Using intents, request one guild at a time
    if (this.client.options.intents) {
      if (!this.client.intents.has(GatewayIntentBits.GuildMembers)) {
        throw new Error('Cannot request all members without guildMembers intent');
      }
      void this.requestGuildMembers({ timeout, guild_id: guildID, query: '', limit: 0, presences });
    } else {
      if (this.getAllUsersLength + 3 + guildID.length > 4048) {
        // 4096 - "{\"op\":8,\"d\":{\"guild_id\":[],\"query\":\"\",\"limit\":0}}".length + 1 for lazy comma offset
        for (const ID of this.getAllUsersQueue) {
          void this.requestGuildMembers({ guild_id: ID, query: '', limit: 0, presences });
        }
        this.getAllUsersQueue = [guildID];
        this.getAllUsersLength = 1 + guildID.length + 3;
      } else {
        this.getAllUsersQueue.push(guildID);
        this.getAllUsersLength += guildID.length + 3;
      }
    }
  }

  hardReset() {
    this.reset();
    this.seq = 0;
    this.sessionID = null;
    this.resumeURL = null;
    this.reconnectInterval = 1000;
    this.connectAttempts = 0;
    this.ws = null;
    this.heartbeatInterval = null;
    this.guildCreateTimeout = null;
    this.globalBucket = new Bucket(120, 60000, { reservedTokens: 5 });
    this.presenceUpdateBucket = new Bucket(5, 20000);
    this.presence = JSON.parse(JSON.stringify(this.client.presence)); // Fast copy
    Object.defineProperty(this, '_token', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: this.client._token
    });
  }

  heartbeat(normal?: boolean) {
    // Can only heartbeat after identify/resume succeeds, session will be killed otherwise, discord/discord-api-docs#1619
    if (this.status === 'resuming' || this.status === 'identifying') {
      return;
    }
    if (normal) {
      if (!this.lastHeartbeatAck) {
        this.emit(
          'debug',
          'Heartbeat timeout; ' +
            JSON.stringify({
              lastReceived: this.lastHeartbeatReceived,
              lastSent: this.lastHeartbeatSent,
              interval: this.heartbeatInterval,
              status: this.status,
              timestamp: Date.now()
            })
        );
        return this.disconnect(
          {
            reconnect: 'auto'
          },
          new Error("Server didn't acknowledge previous heartbeat, possible lost connection")
        );
      }
      this.lastHeartbeatAck = false;
    }
    this.lastHeartbeatSent = Date.now();
    this.sendWS(GatewayOpcodes.Heartbeat, this.seq, true);
  }

  identify() {
    if (this.client.options.compress && !this.zlib?.enabled) {
      /**
       * Fired when the shard encounters an error
       * @event Client#error
       * @prop {Error} err The error
       * @prop {Number} id The ID of the shard
       */
      this.emit('error', new Error('pako/zlib-sync not found, cannot decompress data'));
      return;
    }
    this.status = 'identifying';
    const identify: GatewayIdentifyData = {
      token: this._token,
      compress: !!this.client.options.compress,
      large_threshold: this.client.options.largeThreshold,
      intents: Number(this.client.intents.bits),
      properties: {
        os: process.platform,
        browser: 'astri',
        device: 'astri'
      }
    };
    if (typeof this.client.options.maxShards === 'number' && this.client.options.maxShards > 1) {
      identify.shard = [this.id, this.client.options.maxShards];
    }
    if (this.presence.status) {
      identify.presence = this.presence;
    }
    this.sendWS(GatewayOpcodes.Identify, identify);
  }

  async initializeWS() {
    try {
      if (!this._token) {
        return this.disconnect(undefined, new Error('Token not specified'));
      }

      this.status = 'connecting';
      if (this.client.options.compress) {
        this.emit('debug', 'Initializing zlib compression');
        this.zlib = new ZlibHelper();
        if (!(await this.zlib.init())) {
          this.client.options.compress = false;
        }
      }
      if (this.sessionID) {
        if (!this.resumeURL) {
          this.emit('warn', 'Resume url is not currently present. Discord may disconnect you quicker.');
        }
        this.ws = new WebSocket((this.resumeURL ?? this.client.gatewayURL)!, this.client.options.ws);
      } else {
        this.emit('debug', this.client.gatewayURL!);
        this.ws = new WebSocket(this.client.gatewayURL!, this.client.options.ws);
      }
      this.ws.on('open', this._onWSOpen.bind(this));
      this.ws.on('message', this._onWSMessage.bind(this));
      this.ws.on('error', this._onWSError.bind(this));
      this.ws.on('close', this._onWSClose.bind(this));

      this.connectTimeout = setTimeout(() => {
        if (this.connecting) {
          this.disconnect(
            {
              reconnect: 'auto'
            },
            new Error('Connection timeout')
          );
        }
      }, this.client.options.connectionTimeout);
    } catch (error) {
      this.emit('error', error as Error);
    }
  }

  onPacket(packet: GatewayReceivePayload) {
    if (this.listeners('rawWS').length > 0 || this.client.listeners('rawWS').length) {
      /**
       * Fired when the shard receives a websocket packet
       * @event Client#rawWS
       * @prop {Object} packet The packet
       * @prop {Number} id The ID of the shard
       */
      this.emit('rawWS', packet, this.id);
    }

    if (packet.s) {
      if (packet.s > this.seq + 1 && this.ws && this.status !== 'resuming') {
        /**
         * Fired to warn of something weird but non-breaking happening
         * @event Client#warn
         * @prop {String} message The warning message
         * @prop {Number} id The ID of the shard
         */
        this.emit('warn', `Non-consecutive sequence (${this.seq} -> ${packet.s})`, this.id);
      }
      this.seq = packet.s;
    }

    switch (packet.op) {
      case GatewayOpcodes.Dispatch: {
        if (!this.client.options.disableEvents?.[packet.t]) {
          this.wsEvent(packet);
        }
        break;
      }
      case GatewayOpcodes.Heartbeat: {
        this.heartbeat();
        break;
      }
      case GatewayOpcodes.InvalidSession: {
        this.seq = 0;
        this.sessionID = null;
        this.resumeURL = null;
        this.emit('warn', 'Invalid session, reidentifying!', this.id);
        this.identify();
        break;
      }
      case GatewayOpcodes.Reconnect: {
        this.emit('debug', 'Reconnecting due to server request', this.id);
        this.disconnect({
          reconnect: 'auto'
        });
        break;
      }
      case GatewayOpcodes.Hello: {
        if (packet.d.heartbeat_interval > 0) {
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
          }
          this.heartbeatInterval = setInterval(() => this.heartbeat(true), packet.d.heartbeat_interval);
        }

        // @ts-expect-error -- Says doesn't exist but maybe
        this.discordServerTrace = packet.d._trace;
        this.connecting = false;
        if (this.connectTimeout) {
          clearTimeout(this.connectTimeout);
        }
        this.connectTimeout = null;

        if (this.sessionID) {
          this.resume();
        } else {
          this.identify();
          // Cannot heartbeat when resuming, discord/discord-api-docs#1619
          this.heartbeat();
        }
        /**
         * Fired when a shard receives an OP:10/HELLO packet
         * @event Client#hello
         * @prop {Array<String>} trace The Discord server trace of the gateway and session servers
         * @prop {Number} id The ID of the shard
         */
        // @ts-expect-error -- _trace does exist
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.emit('hello', packet.d._trace, this.id);
        break; /* eslint-enable no-unreachable */
      }
      case GatewayOpcodes.HeartbeatAck: {
        this.lastHeartbeatAck = true;
        this.lastHeartbeatReceived = Date.now();
        this.latency = this.lastHeartbeatReceived - (this.lastHeartbeatSent ?? 0);
        break;
      }
      default: {
        this.emit('unknown', packet, this.id);
        break;
      }
    }
  }

  requestGuildMembers(options: (GatewayRequestGuildMembersDataWithQuery & Partial<GatewayRequestGuildMembersDataWithUserIds>) & { timeout?: number }): Promise<Array<APIGuildMember | Member>> {
    const opts = options;
    if (!opts.user_ids && !opts.query) {
      opts.query = '';
    }
    if (!opts.query && !opts.user_ids && this.client.options.intents && !this.client.intents.has(GatewayIntentBits.GuildMembers)) {
      throw new Error('Cannot request all members without guildMembers intent');
    }
    if (opts.presences && this.client.options.intents && !this.client.intents.has(GatewayIntentBits.GuildPresences)) {
      throw new Error('Cannot request members presences without guildPresences intent');
    }
    if (opts.user_ids && opts.user_ids.length > 100) {
      throw new Error('Cannot request more than 100 users by their ID');
    }
    if (!opts.nonce) opts.nonce = `${new Date().getTime().toString(32)}`;
    this.sendWS(GatewayOpcodes.RequestGuildMembers, opts);
    return new Promise(
      (resolve) =>
        (this.requestMembersPromise[opts.nonce!] = {
          resolve,
          received: 0,
          members: [],
          timeout: setTimeout(
            (ctx) => {
              if (opts.nonce && opts.nonce in ctx.requestMembersPromise) {
                resolve(ctx.requestMembersPromise[opts.nonce].members);
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete ctx.requestMembersPromise[opts.nonce];
              } else {
                resolve([]);
              }
            },
            options?.timeout ?? this.client.options.rest?.requestTimeout,
            this
          )
        })
    );
  }

  // requestGuildSync(guildID: string) {
  //   this.sendWS(GatewayOpcodes.SYNC_GUILD, guildID);
  // }

  reset() {
    this.connecting = false;
    this.ready = false;
    this.preReady = false;
    if (this.requestMembersPromise !== undefined) {
      for (const guildID in this.requestMembersPromise) {
        if (!this.requestMembersPromise[guildID]) {
          continue;
        }
        clearTimeout(this.requestMembersPromise[guildID].timeout);
        this.requestMembersPromise[guildID].resolve(this.requestMembersPromise[guildID].members);
      }
    }
    this.requestMembersPromise = {};
    this.getAllUsersCount = {};
    this.getAllUsersQueue = [];
    this.getAllUsersLength = 1;
    this.guildSyncQueue = [];
    this.guildSyncQueueLength = 1;
    this.unsyncedGuilds = 0;
    this.latency = Infinity;
    this.lastHeartbeatAck = true;
    this.lastHeartbeatReceived = null;
    this.lastHeartbeatSent = null;
    this.status = 'disconnected';
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
    }
    this.connectTimeout = null;
  }

  restartGuildCreateTimeout() {
    if (this.guildCreateTimeout) {
      clearTimeout(this.guildCreateTimeout);
      this.guildCreateTimeout = null;
    }
    if (!this.ready) {
      if (this.client.unavailableGuilds.size === 0 && this.unsyncedGuilds === 0) {
        return this.checkReady();
      }
      this.guildCreateTimeout = setTimeout(() => {
        this.checkReady();
      }, this.client.options.guildCreateTimeout);
    }
  }

  resume() {
    this.status = 'resuming';
    this.sendWS(GatewayOpcodes.Resume, {
      token: this._token,
      session_id: this.sessionID,
      seq: this.seq
    });
  }

  sendPresenceUpdate() {
    this.sendWS(GatewayOpcodes.PresenceUpdate, {
      activities: this.presence.activities,
      afk: !!this.presence.afk, // For push notifications
      since: this.presence.status === 'idle' ? Date.now() : 0,
      status: this.presence.status
    });
  }

  sendWS(op: GatewayOpcodes, _data: any, priority = false) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      let i = 0;
      let waitFor = 1;
      const func = () => {
        if (++i >= waitFor && this.ws && this.ws.readyState === WebSocket.OPEN) {
          const data = JSON.stringify({ op, d: _data });
          this.ws.send(data);
          if (_data.token) {
            delete _data.token;
          }
          this.emit('debug', JSON.stringify({ op, d: _data }), this.id);
        }
      };
      if (op === GatewayOpcodes.PresenceUpdate) {
        ++waitFor;
        this.presenceUpdateBucket.queue(func, priority);
      }
      this.globalBucket.queue(func, priority);
    }
  }

  // syncGuild(guildID: string) {
  //   if (this.guildSyncQueueLength + 3 + guildID.length > 4081) {
  //     // 4096 - "{\"op\":12,\"d\":[]}".length + 1 for lazy comma offset
  //     this.requestGuildSync(this.guildSyncQueue);
  //     this.guildSyncQueue = [guildID];
  //     this.guildSyncQueueLength = 1 + guildID.length + 3;
  //   } else if (this.ready) {
  //     this.requestGuildSync([guildID]);
  //   } else {
  //     this.guildSyncQueue.push(guildID);
  //     this.guildSyncQueueLength += guildID.length + 3;
  //   }
  // }

  wsEvent(packet: GatewayDispatchPayload) {
    switch (packet.t) {
      case GatewayDispatchEvents.PresenceUpdate: {
        if (packet.d.user.username !== undefined) {
          let user = this.client.users.get(packet.d.user.id);
          let oldUser = null;
          if (user && (user.username !== packet.d.user.username || user.discriminator !== packet.d.user.discriminator || user.avatar !== packet.d.user.avatar)) {
            oldUser = {
              username: user.username,
              discriminator: user.discriminator,
              avatar: user.avatar
            };
          }
          if (!user || oldUser) {
            user = this.client.users.update(packet.d.user, this.client);
            /**
             * Fired when a user's avatar, discriminator or username changes
             * @event Client#userUpdate
             * @prop {User} user The updated user
             * @prop {Object?} oldUser The old user data. If the user was uncached, this will be null
             * @prop {String} oldUser.username The username of the user
             * @prop {String} oldUser.discriminator The discriminator of the user
             * @prop {String?} oldUser.avatar The hash of the user's avatar, or null if no avatar
             */
            this.emit('userUpdate', user, oldUser);
          }
        }

        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('debug', 'Rogue presence update: ' + JSON.stringify(packet), this.id);
          break;
        }
        let member = guild.members.get(packet.d.user.id);
        let oldPresence = null;
        if (member) {
          oldPresence = {
            activities: member.activities,
            clientStatus: member.clientStatus,
            status: member.status
          };
        }
        if ((!member && packet.d.user.username) ?? oldPresence) {
          // @ts-expect-error -- It's ok
          member = guild.members.update(packet.d, guild);
          this.emit('presenceUpdate', member, oldPresence);
        }
        break;
      }
      case GatewayDispatchEvents.VoiceStateUpdate: {
        // (╯°□°）╯︵ ┻━┻
        if (packet.d.self_stream === undefined) {
          packet.d.self_stream = false;
        }

        const guild = this.client.guilds.get(packet.d.guild_id!);
        if (!guild) {
          break;
        }

        const payload = packet.d as GatewayVoiceState & { id: string; member: { id: string; user: { id: string } } };
        // Updates the member cache with this member for future events.
        payload.id = packet.d.user_id;
        payload.member.id = packet.d.user_id;
        payload.member.user.id = packet.d.user_id;
        let member = guild.members.get(packet.d.user_id);
        if (!member) {
          if (!packet.d.member) {
            this.emit(
              'voiceStateUpdate',
              {
                id: packet.d.user_id,
                voiceState: {
                  deaf: packet.d.deaf,
                  mute: packet.d.mute,
                  selfDeaf: packet.d.self_deaf,
                  selfMute: packet.d.self_mute,
                  selfStream: packet.d.self_stream,
                  selfVideo: packet.d.self_video
                }
              },
              null
            );
            break;
          }
          member = guild.members.add(payload, guild);

          const channel = guild.channels.find((channel) => channel.isVoiceBased() && channel.voiceMembers.get(packet.d.user_id) !== undefined);
          if (channel?.isVoiceBased()) {
            channel.voiceMembers.remove(payload);
            this.emit('debug', 'VOICE_STATE_UPDATE member null but in channel: ' + payload.id, this.id);
          }
        }
        const oldState = {
          deaf: member.voiceState?.deaf,
          mute: member.voiceState?.mute,
          selfDeaf: member.voiceState?.selfDeaf,
          selfMute: member.voiceState?.selfMute,
          selfStream: member.voiceState?.selfStream,
          selfVideo: member.voiceState?.selfVideo
        };
        const oldChannelID = member.voiceState!.channelID;
        member.update(payload);
        if (oldChannelID !== packet.d.channel_id) {
          let oldChannel: BaseChannel | null | undefined;
          let newChannel: BaseChannel | undefined;
          if (oldChannelID) {
            oldChannel = guild.channels.get(oldChannelID);
            if (oldChannel && !oldChannel.isVoiceBased()) {
              this.emit('warn', 'Old channel not a recognized voice channel: ' + oldChannelID, this.id);
              oldChannel = null;
            }
          }
          if (packet.d.channel_id && (newChannel = guild.channels.get(packet.d.channel_id)) && newChannel.isVoiceBased()) {
            // Welcome to Discord, where one can "join" text channels
            if (oldChannel?.isVoiceBased()) {
              /**
               * Fired when a guild member switches voice channels
               * @event Client#voiceChannelSwitch
               * @prop {Member} member The member
               * @prop {TextVoiceChannel | StageChannel} newChannel The new voice channel
               * @prop {TextVoiceChannel | StageChannel} oldChannel The old voice channel
               */
              oldChannel.voiceMembers.remove(member);
              this.emit('voiceChannelSwitch', newChannel.voiceMembers.add(member, guild), newChannel, oldChannel);
            } else {
              /**
               * Fired when a guild member joins a voice channel. This event is not fired when a member switches voice channels, see `voiceChannelSwitch`
               * @event Client#voiceChannelJoin
               * @prop {Member} member The member
               * @prop {TextVoiceChannel | StageChannel} newChannel The voice channel
               */
              this.emit('voiceChannelJoin', newChannel.voiceMembers.add(member, guild), newChannel);
            }
          } else if (oldChannel?.isVoiceBased()) {
            oldChannel.voiceMembers.remove(member);
            /**
             * Fired when a guild member leaves a voice channel. This event is not fired when a member switches voice channels, see `voiceChannelSwitch`
             * @event Client#voiceChannelLeave
             * @prop {Member?} member The member
             * @prop {TextVoiceChannel | StageChannel} oldChannel The voice channel
             */
            this.emit('voiceChannelLeave', member, oldChannel);
          }
        }
        if (oldState.mute !== member.voiceState?.mute || oldState.deaf !== member.voiceState?.deaf || oldState.selfMute !== member.voiceState?.selfMute || oldState.selfDeaf !== member.voiceState?.selfDeaf || oldState.selfStream !== member.voiceState?.selfStream || oldState.selfVideo !== member.voiceState?.selfVideo) {
          /**
           * Fired when a guild member's voice state changes
           * @event Client#voiceStateUpdate
           * @prop {Member | Object} member The member. If the member is not cached and Discord doesn't send a member payload, this will be an object with `id` and `voiceState` keys. No other property is guaranteed
           * @prop {Object?} oldState The old voice state of the member. If the above caveat applies, this will be null
           * @prop {Boolean} oldState.deaf The previous server deaf status
           * @prop {Boolean} oldState.mute The previous server mute status
           * @prop {Boolean} oldState.selfDeaf The previous self deaf status
           * @prop {Boolean} oldState.selfMute The previous self mute status
           * @prop {Boolean} oldState.selfStream The previous self stream status
           * @prop {Boolean} oldState.selfVideo The previous self video status
           */
          this.emit('voiceStateUpdate', member, oldState);
        }
        break;
      }
      case GatewayDispatchEvents.TypingStart: {
        let member = null;
        const guild = this.client.guilds.get(packet.d.guild_id!);
        if (guild && packet.d.member) {
          // @ts-expect-error -- It's ok
          packet.d.member.id = packet.d.user_id;
          // @ts-expect-error -- It's ok
          member = guild.members.update(packet.d.member, guild);
        }
        if (this.client.listeners('typingStart').length > 0) {
          /**
           * Fired when a user begins typing
           * @event Client#typingStart
           * @prop {PrivateChannel | TextChannel | NewsChannel | Object} channel The text channel the user is typing in. If the channel is not cached, this will be an object with an `id` key. No other property is guaranteed
           * @prop {User | Object} user The user. If the user is not cached, this will be an object with an `id` key. No other property is guaranteed
           * @prop {Member?} member The guild member, if typing in a guild channel, or `null`, if typing in a PrivateChannel
           */
          this.emit('typingStart', this.client.getChannel(packet.d.channel_id) ?? ChannelFactory.create({ id: packet.d.channel_id }, this.client), this.client.users.get(packet.d.user_id) ?? new PartialUser({ id: packet.d.user_id }), member);
        }
        break;
      }
      case GatewayDispatchEvents.MessageCreate: {
        const channel = this.client.getChannel(packet.d.channel_id);
        if (channel?.isTextBased()) {
          // MESSAGE_CREATE just when deleting o.o
          channel.lastMessageID = packet.d.id;
          /**
           * Fired when a message is created
           * @event Client#messageCreate
           * @prop {Message} message The message.
           */
          this.emit('messageCreate', channel.messages.add(packet.d, this.client));
        } else {
          this.emit('messageCreate', new Message(packet.d, this.client));
        }
        break;
      }
      case GatewayDispatchEvents.MessageUpdate: {
        const channel = this.client.getChannel(packet.d.channel_id);
        if (!channel?.isTextBased()) {
          this.emit('messageUpdate', packet.d, null);
          break;
        }
        const message = channel.messages.get(packet.d.id);
        let oldMessage = null;
        if (message) {
          oldMessage = {
            attachments: message.attachments,
            channelMentions: message.channelMentions,
            content: message.content,
            editedTimestamp: message.editedTimestamp,
            embeds: message.embeds,
            flags: message.flags,
            mentions: message.mentions,
            pinned: message.pinned,
            roleMentions: message.roleMentions,
            tts: message.tts
          };
        } else if (!packet.d.timestamp) {
          // @ts-expect-error -- It's ok
          packet.d.channel = channel;
          this.emit('messageUpdate', packet.d, null);
          break;
        }
        /**
         * Fired when a message is updated
         * @event Client#messageUpdate
         * @prop {Message} message The updated message. If oldMessage is null, it is recommended to discard this event, since the message data will be very incomplete (only `id` and `channel` are guaranteed). If the channel isn't cached, `channel` will be an object with an `id` key.
         * @prop {Object?} oldMessage The old message data. If the message was cached, this will return the full old message. Otherwise, it will be null
         * @prop {Array<Object>} oldMessage.attachments Array of attachments
         * @prop {Array<String>} oldMessage.channelMentions Array of mentions channels' ids.
         * @prop {String} oldMessage.content Message content
         * @prop {Number} oldMessage.editedTimestamp Timestamp of latest message edit
         * @prop {Array<Object>} oldMessage.embeds Array of embeds
         * @prop {Number} oldMessage.flags Old message flags (see constants)
         * @prop {Object} oldMessage.mentionedBy Object of if different things mention the bot user
         * @prop {Array<User>} oldMessage.mentions Array of mentioned users' ids
         * @prop {Boolean} oldMessage.pinned Whether the message was pinned or not
         * @prop {Array<String>} oldMessage.roleMentions Array of mentioned roles' ids.
         * @prop {Boolean} oldMessage.tts Whether to play the message using TTS or not
         */
        this.emit('messageUpdate', channel.messages.update(packet.d, this.client), oldMessage);
        break;
      }
      case GatewayDispatchEvents.MessageDelete: {
        const channel = this.client.getChannel(packet.d.channel_id);
        if (!channel?.isTextBased()) break;
        /**
         * Fired when a cached message is deleted
         * @event Client#messageDelete
         * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. If the channel is not cached, channel will be an object with an `id` key. If the uncached message is from a guild, the message will also contain a `guildID` key, and the channel will contain a `guild` with an `id` key. No other property is guaranteed.
         */
        this.emit(
          'messageDelete',
          channel.messages.remove(packet.d) ?? {
            id: packet.d.id,
            channel: channel || {
              id: packet.d.channel_id,
              guild: packet.d.guild_id ? { id: packet.d.guild_id } : undefined
            },
            guildID: packet.d.guild_id
          }
        );
        break;
      }
      case GatewayDispatchEvents.MessageDeleteBulk: {
        const channel = this.client.getChannel(packet.d.channel_id);
        if (!channel?.isTextBased()) break;
        /**
         * Fired when a bulk delete occurs
         * @event Client#messageDeleteBulk
         * @prop {Array<Message> | Array<Object>} messages An array of (potentially partial) message objects. If a message is not cached, it will be an object with `id` and `channel` keys If the uncached messages are from a guild, the messages will also contain a `guildID` key, and the channel will contain a `guild` with an `id` key. No other property is guaranteed
         */
        this.emit(
          'messageDeleteBulk',
          packet.d.ids.map(
            (id) =>
              channel?.messages.remove({
                id
              }) ?? {
                id,
                channel: { id: packet.d.channel_id, guild: packet.d.guild_id ? { id: packet.d.guild_id } : undefined },
                guildID: packet.d.guild_id
              }
          )
        );
        break;
      }
      case 'MESSAGE_REACTION_ADD': {
        const channel = this.client.getChannel(packet.d.channel_id);
        let message: Message | UncachedMessage | undefined;
        let member;
        if (channel?.isTextBased()) {
          message = channel.messages.get(packet.d.message_id);
          if (channel.inGuild()) {
            if (packet.d.member) {
              // Updates the member cache with this member for future events.
              const payload = packet.d.member as APIGuildMember & { id: string };
              payload.id = packet.d.user_id;
              member = channel.guild.members.update(payload, channel.guild);
            }
          }
        }
        if (message instanceof Message) {
          const reaction = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name!;
          if (message.reactions[reaction]) {
            ++message.reactions[reaction].count;
            if (packet.d.user_id === this.client.user.id) {
              message.reactions[reaction].me = true;
            }
          } else {
            message.reactions[reaction] = {
              count: 1,
              me: packet.d.user_id === this.client.user.id
            };
          }
        } else {
          message = {
            id: packet.d.message_id,
            channel: channel ?? { id: packet.d.channel_id }
          };

          if (packet.d.guild_id) {
            message.guildID = packet.d.guild_id;
          }
        }
        /**
         * Fired when someone adds a reaction to a message
         * @event Client#messageReactionAdd
         * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id`, `channel`, and if inside a guild, `guildID` keys. If the channel is not cached, channel key will be an object with only an id. `guildID` will be present if the message was sent in a guild channel. No other property is guaranteed
         * @prop {Object} emoji The reaction emoji object
         * @prop {Boolean?} emoji.animated Whether the emoji is animated or not
         * @prop {String?} emoji.id The emoji ID (null for non-custom emojis)
         * @prop {String} emoji.name The emoji name
         * @prop {Member | Object} reactor The member, if the reaction is in a guild. If the reaction is not in a guild, this will be an object with an `id` key. No other property is guaranteed
         */
        this.emit('messageReactionAdd', message, packet.d.emoji, member ?? new PartialUser({ id: packet.d.user_id }));
        break;
      }
      case 'MESSAGE_REACTION_REMOVE': {
        const channel = this.client.getChannel(packet.d.channel_id);
        let message: Message | UncachedMessage | undefined;
        if (channel?.isTextBased()) {
          message = channel.messages.get(packet.d.message_id);
        }
        if (message instanceof Message) {
          const reaction = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name!;
          const reactionObj = message.reactions[reaction];
          if (reactionObj) {
            --reactionObj.count;
            if (reactionObj.count === 0) {
              // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
              delete message.reactions[reaction];
            } else if (packet.d.user_id === this.client.user.id) {
              reactionObj.me = false;
            }
          }
        } else {
          message = {
            id: packet.d.message_id,
            channel: channel ?? { id: packet.d.channel_id }
          };

          if (packet.d.guild_id) {
            message.guildID = packet.d.guild_id;
          }
        }
        /**
         * Fired when someone removes a reaction from a message
         * @event Client#messageReactionRemove
         * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id`, `channel`, and if inside a guild, `guildID` keys. If the channel is not cached, channel key will be an object with only an id. `guildID` will be present if the message was sent in a guild channel. No other property is guaranteed
         * @prop {Object} emoji The reaction emoji object
         * @prop {Boolean?} emoji.animated Whether the emoji is animated or not
         * @prop {String?} emoji.id The ID of the emoji (null for non-custom emojis)
         * @prop {String} emoji.name The emoji name
         * @prop {String} userID The ID of the user that removed the reaction
         */
        this.emit('messageReactionRemove', message, packet.d.emoji, packet.d.user_id);
        break;
      }
      case 'MESSAGE_REACTION_REMOVE_ALL': {
        const channel = this.client.getChannel(packet.d.channel_id);
        let message: Message | UncachedMessage | undefined;
        if (channel?.isTextBased()) {
          message = channel.messages.get(packet.d.message_id);
          if (message instanceof Message) {
            message.reactions = {};
          }
        }
        if (!(message instanceof Message)) {
          message = {
            id: packet.d.message_id,
            channel: channel ?? { id: packet.d.channel_id }
          };
          if (packet.d.guild_id) {
            message.guildID = packet.d.guild_id;
          }
        }
        /**
         * Fired when all reactions are removed from a message
         * @event Client#messageReactionRemoveAll
         * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id`, `channel`, and if inside a guild, `guildID` keys. If the channel is not cached, channel key will be an object with only an id. No other property is guaranteed
         */
        this.emit('messageReactionRemoveAll', message);
        break;
      }
      case 'MESSAGE_REACTION_REMOVE_EMOJI': {
        const channel = this.client.getChannel(packet.d.channel_id);
        let message: Message | UncachedMessage | undefined;
        if (channel?.isTextBased()) {
          message = channel.messages.get(packet.d.message_id);
          if (message instanceof Message) {
            const reaction = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name!;
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete message.reactions[reaction];
          }
        }
        if (!message) {
          message = {
            id: packet.d.message_id,
            channel: channel ?? { id: packet.d.channel_id }
          };
          if (packet.d.guild_id) {
            message.guildID = packet.d.guild_id!;
          }
        }
        /**
         * Fired when someone removes all reactions from a message for a single emoji
         * @event Client#messageReactionRemoveEmoji
         * @prop {Message | Object} message The message object. If the message is not cached, this will be an object with `id` and `channel` keys. If the channel is not cached, channel key will be an object with only an id. No other property is guaranteed
         * @prop {Object} emoji The reaction emoji object
         * @prop {Boolean?} emoji.animated Whether the emoji is animated or not
         * @prop {String?} emoji.id The ID of the emoji (null for non-custom emojis)
         * @prop {String} emoji.name The emoji name
         */
        this.emit('messageReactionRemoveEmoji', message, packet.d.emoji);
        break;
      }
      case 'GUILD_MEMBER_ADD': {
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          // Eventual Consistency™ (╯°□°）╯︵ ┻━┻
          this.emit('debug', `Missing guild ${packet.d.guild_id} in GUILD_MEMBER_ADD`);
          break;
        }
        const payload = packet.d as GatewayGuildMemberAddDispatchData & { id: string };
        payload.id = packet.d.user.id;
        ++guild.memberCount;
        /**
         * Fired when a member joins a server
         * @event Client#guildMemberAdd
         * @prop {Guild} guild The guild
         * @prop {Member} member The member
         */
        this.emit('guildMemberAdd', guild, guild.members.add(payload, guild));
        break;
      }
      case 'GUILD_MEMBER_UPDATE': {
        // Check for member update if guildPresences intent isn't set, to prevent emitting twice
        if (!this.client.intents.has(GatewayIntentBits.GuildPresences) && packet.d.user.username !== undefined) {
          let user = this.client.users.get(packet.d.user.id);
          let oldUser = null;
          if (user && (user.username !== packet.d.user.username || user.discriminator !== packet.d.user.discriminator || user.avatar !== packet.d.user.avatar)) {
            oldUser = {
              username: user.username,
              discriminator: user.discriminator,
              avatar: user.avatar
            };
          }
          if (!user || oldUser) {
            user = this.client.users.update(packet.d.user, this.client);
            this.emit('userUpdate', user, oldUser);
          }
        }
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('debug', `Missing guild ${packet.d.guild_id} in GUILD_MEMBER_UPDATE`);
          break;
        }
        const payload = packet.d as GatewayGuildMemberUpdateDispatchData & { id: string };
        payload.id = packet.d.user.id;
        let member = guild.members.get(payload.id);
        let oldMember = null;
        if (member) {
          oldMember = {
            avatar: member.avatar,
            communicationDisabledUntil: member.communicationDisabledUntil,
            roles: member.roles,
            nick: member.nick,
            premiumSince: member.premiumSince,
            pending: member.pending
          };
        }
        member = guild.members.update(payload, guild);
        /**
         * Fired when a member's guild avatar, roles or nickname are updated or they start boosting a server
         * @event Client#guildMemberUpdate
         * @prop {Guild} guild The guild
         * @prop {Member} member The updated member
         * @prop {Object?} oldMember The old member data, or null if the member wasn't cached
         * @prop {String?} oldMember.avatar The hash of the member's guild avatar, or null if no guild avatar
         * @prop {Number?} communicationDisabledUntil Timestamp of previous timeout expiry. If `null`, the member was not timed out
         * @prop {Array<String>} oldMember.roles An array of role IDs this member is a part of
         * @prop {String?} oldMember.nick The server nickname of the member
         * @prop {Number?} oldMember.premiumSince Timestamp of when the member boosted the guild
         * @prop {Boolean?} oldMember.pending Whether the member has passed the guild's Membership Screening requirements
         */
        this.emit('guildMemberUpdate', guild, member, oldMember);
        break;
      }
      case 'GUILD_MEMBER_REMOVE': {
        if (packet.d.user.id === this.client.user.id) {
          // The bot is probably leaving
          break;
        }
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          break;
        }
        --guild.memberCount;
        // @ts-expect-error -- need id
        packet.d.id = packet.d.user.id;
        /**
         * Fired when a member leaves a server
         * @event Client#guildMemberRemove
         * @prop {Guild} guild The guild
         * @prop {Member | Object} member The member. If the member is not cached, this will be an object with `id` and `user` key
         */
        this.emit(
          'guildMemberRemove',
          guild,
          // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
          guild.members.remove(packet.d) ?? {
            id: packet.d.user.id,
            user: new User(packet.d.user, this.client)
          }
        );
        break;
      }
      case 'GUILD_CREATE': {
        if (!packet.d.unavailable) {
          const guild = this.createGuild(packet.d);
          if (this.ready) {
            if (this.client.unavailableGuilds.remove(packet.d)) {
              /**
               * Fired when a guild becomes available
               * @event Client#guildAvailable
               * @prop {Guild} guild The guild
               */
              this.emit('guildAvailable', guild);
            } else {
              /**
               * Fired when a guild is created. This happens when:
               * - the client creates a guild
               * - the client joins a guild
               * @event Client#guildCreate
               * @prop {Guild} guild The guild
               */
              this.emit('guildCreate', guild);
            }
          } else {
            this.client.unavailableGuilds.remove(packet.d);
            this.restartGuildCreateTimeout();
          }
        } else {
          this.client.guilds.remove(packet.d);
          /**
           * Fired when an unavailable guild is created
           * @event Client#unavailableGuildCreate
           * @prop {UnavailableGuild} guild The unavailable guild
           */
          this.emit('unavailableGuildCreate', this.client.unavailableGuilds.add(packet.d, this.client));
        }
        break;
      }
      case 'GUILD_UPDATE': {
        const guild = this.client.guilds.get(packet.d.id);
        if (!guild) {
          this.emit('debug', `Guild ${packet.d.id} undefined in GUILD_UPDATE`);
          break;
        }
        const oldGuild = {
          afkChannelID: guild.afkChannelID,
          afkTimeout: guild.afkTimeout,
          banner: guild.banner,
          defaultNotifications: guild.defaultNotifications,
          description: guild.description,
          discoverySplash: guild.discoverySplash,
          emojis: guild.emojis,
          explicitContentFilter: guild.explicitContentFilter,
          features: guild.features,
          icon: guild.icon,
          large: guild.large,
          maxMembers: guild.maxMembers,
          maxVideoChannelUsers: guild.maxVideoChannelUsers,
          mfaLevel: guild.mfaLevel,
          name: guild.name,
          nsfwLevel: guild.nsfwLevel,
          ownerID: guild.ownerID,
          preferredLocale: guild.preferredLocale,
          premiumSubscriptionCount: guild.premiumSubscriptionCount,
          premiumTier: guild.premiumTier,
          publicUpdatesChannelID: guild.publicUpdatesChannelID,
          rulesChannelID: guild.rulesChannelID,
          splash: guild.splash,
          stickers: guild.stickers,
          systemChannelFlags: guild.systemChannelFlags,
          systemChannelID: guild.systemChannelID,
          vanityURL: guild.vanityURL,
          verificationLevel: guild.verificationLevel
        };
        /**
         * Fired when a guild is updated
         * @event Client#guildUpdate
         * @prop {Guild} guild The guild
         * @prop {Object} oldGuild The old guild data
         * @prop {String?} oldGuild.afkChannelID The ID of the AFK voice channel
         * @prop {Number} oldGuild.afkTimeout The AFK timeout in seconds
         * @prop {String?} oldGuild.banner The hash of the guild banner image, or null if no splash (VIP only)
         * @prop {Number} oldGuild.defaultNotifications The default notification settings for the guild. 0 is "All Messages", 1 is "Only @mentions"
         * @prop {String?} oldGuild.description The description for the guild (VIP only)
         * @prop {Array<Object>} oldGuild.emojis An array of guild emojis
         * @prop {Number} oldGuild.explicitContentFilter The explicit content filter level for the guild. 0 is off, 1 is on for people without roles, 2 is on for all
         * @prop {Array<String>} oldGuild.features An array of guild features
         * @prop {String?} oldGuild.icon The hash of the guild icon, or null if no icon
         * @prop {Boolean} oldGuild.large Whether the guild is "large" by "some Discord standard"
         * @prop {Number?} oldGuild.maxMembers The maximum number of members for this guild
         * @prop {Number?} oldGuild.maxVideoChannelUsers The max number of users allowed in a video channel
         * @prop {Number} oldGuild.mfaLevel The admin 2FA level for the guild. 0 is not required, 1 is required
         * @prop {String} oldGuild.name The name of the guild
         * @prop {Boolean} oldGuild.nsfw [DEPRECATED] Whether the guild is designated as NSFW by Discord
         * @prop {Number} oldGuild.nsfwLevel The guild NSFW level designated by Discord
         * @prop {String} oldGuild.ownerID The ID of the user that is the guild owner
         * @prop {String} oldGuild.preferredLocale Preferred "COMMUNITY" guild language used in server discovery and notices from Discord
         * @prop {Number?} oldGuild.premiumSubscriptionCount The total number of users currently boosting this guild
         * @prop {Number} oldGuild.premiumTier Nitro boost level of the guild
         * @prop {String?} oldGuild.publicUpdatesChannelID ID of the guild's updates channel if the guild has "COMMUNITY" features
         * @prop {String?} oldGuild.rulesChannelID The channel where "COMMUNITY" guilds display rules and/or guidelines
         * @prop {String?} oldGuild.splash The hash of the guild splash image, or null if no splash (VIP only)
         * @prop {Array<Object>?} stickers An array of guild sticker objects
         * @prop {Number} oldGuild.systemChannelFlags the flags for the system channel
         * @prop {String?} oldGuild.systemChannelID The ID of the default channel for system messages (built-in join messages and boost messages)
         * @prop {String?} oldGuild.vanityURL The vanity URL of the guild (VIP only)
         * @prop {Number} oldGuild.verificationLevel The guild verification level
         */
        this.emit('guildUpdate', this.client.guilds.update(packet.d, this.client), oldGuild);
        break;
      }
      case 'GUILD_DELETE': {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.client.guildShardMap[packet.d.id];
        const guild = this.client.guilds.remove(packet.d);
        if (guild) {
          // Discord sends GUILD_DELETE for guilds that were previously unavailable in READY
          guild.channels.forEach((channel) => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.client.channelGuildMap[channel.id];
          });
        }
        if (packet.d.unavailable) {
          /**
           * Fired when a guild becomes unavailable
           * @event Client#guildUnavailable
           * @prop {Guild} guild The guild
           */
          this.emit('guildUnavailable', this.client.unavailableGuilds.add(packet.d, this.client));
        } else {
          /**
           * Fired when a guild is deleted. This happens when:
           * - the client left the guild
           * - the client was kicked/banned from the guild
           * - the guild was literally deleted
           * @event Client#guildDelete
           * @prop {Guild | Object} guild The guild. If the guild was not cached, it will be an object with an `id` key. No other property is guaranteed
           */
          this.emit(
            'guildDelete',
            guild ?? {
              id: packet.d.id
            }
          );
        }
        break;
      }
      case 'GUILD_BAN_ADD': {
        /**
         * Fired when a user is banned from a guild
         * @event Client#guildBanAdd
         * @prop {Guild} guild The guild
         * @prop {User} user The banned user
         */
        // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
        this.emit('guildBanAdd', this.client.guilds.get(packet.d.guild_id), this.client.users.update(packet.d.user, this.client));
        break;
      }
      case 'GUILD_BAN_REMOVE': {
        /**
         * Fired when a user is unbanned from a guild
         * @event Client#guildBanRemove
         * @prop {Guild} guild The guild
         * @prop {User} user The banned user
         */
        // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
        this.emit('guildBanRemove', this.client.guilds.get(packet.d.guild_id), this.client.users.update(packet.d.user, this.client));
        break;
      }
      case 'GUILD_ROLE_CREATE': {
        /**
         * Fired when a guild role is created
         * @event Client#guildRoleCreate
         * @prop {Guild} guild The guild
         * @prop {Role} role The role
         */
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('debug', `Missing guild ${packet.d.guild_id} in GUILD_ROLE_CREATE`);
          break;
        }
        this.emit('guildRoleCreate', guild, guild.roles.add(packet.d.role, guild));
        break;
      }
      case 'GUILD_ROLE_UPDATE': {
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('debug', `Guild ${packet.d.guild_id} undefined in GUILD_ROLE_UPDATE`);
          break;
        }
        const role = guild.roles.add(packet.d.role, guild);
        if (!role) {
          this.emit('debug', `Role ${packet.d.role.id} in guild ${packet.d.guild_id} undefined in GUILD_ROLE_UPDATE`);
          break;
        }
        const oldRole = {
          color: role.color,
          hoist: role.hoist,
          icon: role.icon,
          managed: role.managed,
          mentionable: role.mentionable,
          name: role.name,
          permissions: role.permissions,
          position: role.position,
          tags: role.tags,
          unicodeEmoji: role.unicodeEmoji
        };
        /**
         * Fired when a guild role is updated
         * @event Client#guildRoleUpdate
         * @prop {Guild} guild The guild
         * @prop {Role} role The updated role
         * @prop {Object} oldRole The old role data
         * @prop {Number} oldRole.color The hex color of the role in base 10
         * @prop {Boolean} oldRole.hoist Whether users with this role are hoisted in the user list or not
         * @prop {String?} oldRole.icon The hash of the role's icon, or null if no icon
         * @prop {Boolean} oldRole.managed Whether a guild integration manages this role or not
         * @prop {Boolean} oldRole.mentionable Whether the role is mentionable or not
         * @prop {String} oldRole.name The name of the role
         * @prop {Permission} oldRole.permissions The permissions number of the role
         * @prop {Number} oldRole.position The position of the role
         * @prop {Object?} oldRole.tags The tags of the role
         * @prop {String?} oldRole.unicodeEmoji Unicode emoji for the role
         */
        this.emit('guildRoleUpdate', guild, guild.roles.update(packet.d.role, guild), oldRole);
        break;
      }
      case 'GUILD_ROLE_DELETE': {
        /**
         * Fired when a guild role is deleted
         * @event Client#guildRoleDelete
         * @prop {Guild} guild The guild
         * @prop {Role} role The role
         */
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('debug', `Missing guild ${packet.d.guild_id} in GUILD_ROLE_DELETE`);
          break;
        }
        if (!guild.roles.has(packet.d.role_id)) {
          this.emit('debug', `Missing role ${packet.d.role_id} in GUILD_ROLE_DELETE`);
          break;
        }
        // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
        this.emit('guildRoleDelete', guild, guild.roles.remove({ id: packet.d.role_id }));
        break;
      }
      case 'INVITE_CREATE': {
        const guild = this.client.guilds.get(packet.d.guild_id!);
        if (!guild) {
          this.emit('debug', `Missing guild ${packet.d.guild_id} in INVITE_CREATE`);
          break;
        }
        const channel = this.client.getChannel(packet.d.channel_id);
        if (!channel) {
          this.emit('debug', `Missing channel ${packet.d.channel_id} in INVITE_CREATE`);
          break;
        }
        /**
         * Fired when a guild invite is created
         * @event Client#inviteCreate
         * @prop {Guild} guild The guild this invite was created in.
         * @prop {Invite} invite The invite that was created
         */
        this.emit('inviteCreate', guild, new Invite(packet.d, this.client));
        break;
      }
      case 'INVITE_DELETE': {
        const guild = this.client.guilds.get(packet.d.guild_id!);
        if (!guild) {
          this.emit('debug', `Missing guild ${packet.d.guild_id} in INVITE_DELETE`);
          break;
        }
        const channel = this.client.getChannel(packet.d.channel_id);
        if (!channel) {
          this.emit('debug', `Missing channel ${packet.d.channel_id} in INVITE_DELETE`);
          break;
        }
        /**
         * Fired when a guild invite is deleted
         * @event Client#inviteDelete
         * @prop {Guild} guild The guild this invite was created in.
         * @prop {Invite} invite The invite that was deleted
         */
        this.emit('inviteDelete', guild, new Invite(packet.d, this.client));
        break;
      }
      case 'CHANNEL_CREATE': {
        const channel = ChannelFactory.create(packet.d, this.client);
        if ('guild_id' in packet.d && packet.d.guild_id) {
          const guild = this.client.guilds.get(packet.d.guild_id)!;

          guild.channels.add(channel, this.client);
          this.client.channelGuildMap[packet.d.id] = packet.d.guild_id;
          /**
           * Fired when a channel is created
           * @event Client#channelCreate
           * @prop {TextChannel | TextVoiceChannel | CategoryChannel | StoreChannel | NewsChannel | GuildChannel} channel The channel
           */
          this.emit('channelCreate', channel);
        } else {
          this.emit('warn', new Error('Unhandled CHANNEL_CREATE type: ' + JSON.stringify(packet, null, 2)));
          break;
        }
        break;
      }
      case 'CHANNEL_UPDATE': {
        let channel = this.client.getChannel(packet.d.id);
        if (!channel) {
          break;
        }
        let oldChannel;
        if (channel instanceof GuildChannel) {
          oldChannel = {
            bitrate: channel.isVoiceBased() ? channel.bitrate : null,
            name: channel.name,
            nsfw: channel.nsfw,
            parentID: channel.parentID,
            permissionOverwrites: channel.permissionOverwrites,
            position: channel.position,
            rateLimitPerUser: channel.isTextBased() ? channel.rateLimitPerUser : null,
            rtcRegion: channel.isVoiceBased() ? channel.rtcRegion : null,
            topic: channel.topic,
            type: channel.type,
            userLimit: channel.isVoiceBased() ? channel.userLimit : null,
            videoQualityMode: channel.isVoiceBased() ? channel.videoQualityMode : null
          };
        } else {
          this.emit('warn', `Unexpected CHANNEL_UPDATE for channel ${packet.d.id} with type ${packet.d.type}`);
        }
        const oldType = channel.type;
        if (oldType === packet.d.type) {
          // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
          channel.update(packet.d);
        } else {
          this.emit('debug', `Channel ${packet.d.id} changed from type ${oldType} to ${packet.d.type}`);
          const newChannel = ChannelFactory.create(packet.d, this.client);
          if ('guild_id' in packet.d && packet.d.guild_id && channel.inGuild()) {
            const guild = this.client.guilds.get(packet.d.guild_id);
            if (!guild) {
              this.emit('debug', `Received CHANNEL_UPDATE for channel in missing guild ${packet.d.guild_id}`);
              break;
            }
            guild.channels.remove(channel);
            guild.channels.add(newChannel, this.client);
          } else if (channel instanceof PrivateChannel) {
            this.client.privateChannels.remove(channel);
            this.client.privateChannels.add(newChannel, this.client);
          } else {
            this.emit('warn', new Error('Unhandled CHANNEL_UPDATE type: ' + JSON.stringify(packet, null, 2)));
            break;
          }
          channel = newChannel;
        }

        /**
         * Fired when a channel is updated
         * @event Client#channelUpdate
         * @prop {TextChannel | TextVoiceChannel | CategoryChannel | StoreChannel | NewsChannel | GuildChannel | PrivateChannel} channel The updated channel
         * @prop {Object} oldChannel The old channel data
         * @prop {Number} oldChannel.bitrate The bitrate of the channel (voice channels only)
         * @prop {String} oldChannel.name The name of the channel
         * @prop {Boolean} oldChannel.nsfw Whether the channel is NSFW or not (text channels only)
         * @prop {String?} oldChannel.parentID The ID of the category this channel belongs to (guild channels only)
         * @prop {Collection} oldChannel.permissionOverwrites Collection of PermissionOverwrites in this channel (guild channels only)
         * @prop {Number} oldChannel.position The position of the channel (guild channels only)
         * @prop {Number?} oldChannel.rateLimitPerUser The ratelimit of the channel, in seconds. 0 means no ratelimit is enabled (text channels only)
         * @prop {String?} oldChannel.rtcRegion The RTC region ID of the channel (automatic when `null`) (voice channels only)
         * @prop {String?} oldChannel.topic The topic of the channel (text channels only)
         * @prop {Number} oldChannel.type The type of the old channel (text/news channels only)
         * @prop {Number?} oldChannel.userLimit The max number of users that can join the channel (voice channels only)
         * @prop {Number?} oldChannel.videoQualityMode The camera video quality mode of the channel (voice channels only)
         */
        this.emit('channelUpdate', channel, oldChannel);
        break;
      }
      case 'CHANNEL_DELETE': {
        // @ts-expect-error -- Discord API Types removed DM from the channel types that can call this event, however I still want to leave this in, just in case
        if (packet.d.type === ChannelType.DM || packet.d.type === undefined) {
          if (this.id === 0) {
            const channel = this.client.privateChannels.remove(packet.d);
            if (channel) {
              // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
              delete this.client.privateChannelMap[channel.recipient!.id];
              /**
               * Fired when a channel is deleted
               * @event Client#channelDelete
               * @prop {PrivateChannel | TextChannel | NewsChannel | TextVoiceChannel | CategoryChannel} channel The channel
               */
              this.emit('channelDelete', channel);
            }
          }
        } else if ('guild_id' in packet.d && packet.d.guild_id) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete this.client.channelGuildMap[packet.d.id];
          const guild = this.client.guilds.get(packet.d.guild_id);
          if (!guild) {
            this.emit('debug', `Missing guild ${packet.d.guild_id} in CHANNEL_DELETE`);
            break;
          }
          const channel = guild.channels.remove(packet.d);
          if (!channel) {
            break;
          }
          if (channel.isVoiceBased()) {
            channel.voiceMembers.forEach((member) => {
              channel.voiceMembers.remove(member);
              this.emit('voiceChannelLeave', member, channel);
            });
          }
          this.emit('channelDelete', channel);
        } else {
          this.emit('warn', new Error('Unhandled CHANNEL_DELETE type: ' + JSON.stringify(packet, null, 2)));
        }
        break;
      }
      case 'GUILD_MEMBERS_CHUNK': {
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('debug', `Received GUILD_MEMBERS_CHUNK, but guild ${packet.d.guild_id} is ` + (this.client.unavailableGuilds.has(packet.d.guild_id) ? 'unavailable' : 'missing'), this.id);
          break;
        }

        const members = packet.d.members.map((member) => {
          const payload = member as APIGuildMember & { id: string };
          payload.id = member.user.id;
          return guild.members.add(payload, guild);
        });

        if (packet.d.presences) {
          packet.d.presences.forEach((presence) => {
            const member = guild.members.get(presence.user.id);
            if (member) {
              // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
              member.update(presence);
            }
          });
        }

        if (this.requestMembersPromise[packet.d.nonce!]) {
          this.requestMembersPromise[packet.d.nonce!].members.push(...members);
        }

        if (packet.d.chunk_index >= packet.d.chunk_count - 1) {
          if (this.requestMembersPromise[packet.d.nonce!]) {
            clearTimeout(this.requestMembersPromise[packet.d.nonce!].timeout);
            this.requestMembersPromise[packet.d.nonce!].resolve(this.requestMembersPromise[packet.d.nonce!].members);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.requestMembersPromise[packet.d.nonce!];
          }
          if (this.getAllUsersCount[guild.id]) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete this.getAllUsersCount[guild.id];
            this.checkReady();
          }
        }

        /**
         * Fired when Discord sends member chunks
         * @event Client#guildMemberChunk
         * @prop {Guild} guild The guild the chunked members are in
         * @prop {Array<Member>} members The members in the chunk
         */
        this.emit('guildMemberChunk', guild, members);

        this.lastHeartbeatAck = true;

        break;
      }
      case 'RESUMED':
      case 'READY': {
        this.connectAttempts = 0;
        this.reconnectInterval = 1000;

        this.connecting = false;
        if (this.connectTimeout) {
          clearTimeout(this.connectTimeout);
        }
        this.connectTimeout = null;
        this.status = 'ready';
        this.presence.status = PresenceUpdateStatus.Online;
        this.client.shards._readyPacketCB(this.id);

        if (packet.t === 'RESUMED') {
          // Can only heartbeat after resume succeeds, discord/discord-api-docs#1619
          this.heartbeat();

          this.preReady = true;
          this.ready = true;

          /**
           * Fired when a shard finishes resuming
           * @event Shard#resume
           */
          super.emit('resume');
          break;
        } else {
          this.resumeURL = `${packet.d.resume_gateway_url}?v=${GatewayVersion}&encoding=json`;

          if (this.client.options.compress) {
            this.resumeURL += '&compress=zlib-stream';
          }
        }

        this.client.user = this.client.users.update(new User(packet.d.user, this.client), this.client);
        if (this.client.user.bot) {
          this.client.bot = true;
          if (!this.client._token.startsWith('Bot ')) {
            this.client._token = 'Bot ' + this.client._token;
          }
        }

        // @ts-expect-error -- Did they remove traces?
        if (packet.d._trace) {
          // @ts-expect-error -- Did they remove traces?
          this.discordServerTrace = packet.d._trace;
        }

        this.sessionID = packet.d.session_id;

        packet.d.guilds.forEach((guild) => {
          if (guild.unavailable) {
            this.client.guilds.remove(guild);
            this.client.unavailableGuilds.add(guild, this.client, true);
          } else {
            this.client.unavailableGuilds.remove(this.createGuild(guild));
          }
        });

        this.client.application = packet.d.application;

        this.preReady = true;
        /**
         * Fired when a shard finishes processing the ready packet
         * @event Client#shardPreReady
         * @prop {Number} id The ID of the shard
         */
        this.emit('shardPreReady', this.id);

        if (this.client.unavailableGuilds.size > 0 && packet.d.guilds.length > 0) {
          this.restartGuildCreateTimeout();
        } else {
          this.checkReady();
        }

        break;
      }
      case 'VOICE_SERVER_UPDATE': {
        // @ts-expect-error -- I hate how everything is reassigning the packet data
        packet.d.session_id = this.sessionID;
        // @ts-expect-error -- I hate how everything is reassigning the packet data
        packet.d.user_id = this.client.user.id;
        // @ts-expect-error -- I hate how everything is reassigning the packet data
        packet.d.shard = this;
        break;
      }
      case 'USER_UPDATE': {
        let user = this.client.users.get(packet.d.id);
        let oldUser = null;
        if (user) {
          oldUser = {
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar
          };
        }
        user = this.client.users.update(packet.d, this.client);
        this.emit('userUpdate', user, oldUser);
        break;
      }
      case 'GUILD_EMOJIS_UPDATE': {
        const guild = this.client.guilds.get(packet.d.guild_id);
        let oldEmojis = null;
        let emojis = packet.d.emojis;
        if (guild) {
          oldEmojis = guild.emojis;

          guild.update(packet.d);
          emojis = guild.emojis;
        }
        /**
         * Fired when a guild's emojis are updated
         * @event Client#guildEmojisUpdate
         * @prop {Guild} guild The guild. If the guild is uncached, this is an object with an ID key. No other property is guaranteed
         * @prop {Array} emojis The updated emojis of the guild
         * @prop {Array?} oldEmojis The old emojis of the guild. If the guild is uncached, this will be null
         */
        this.emit('guildEmojisUpdate', guild ?? { id: packet.d.guild_id }, emojis, oldEmojis);
        break;
      }
      case 'GUILD_STICKERS_UPDATE': {
        const guild = this.client.guilds.get(packet.d.guild_id);
        let oldStickers = null;
        let stickers = packet.d.stickers;
        if (guild) {
          oldStickers = guild.stickers;
          guild.update(packet.d);
          stickers = guild.stickers;
        }
        /**
         * Fired when a guild's stickers are updated
         * @event Client#guildStickersUpdate
         * @prop {Guild} guild The guild. If the guild is uncached, this is an object with an ID key. No other property is guaranteed
         * @prop {Array} stickers The updated stickers of the guild
         * @prop {Array?} oldStickers The old stickers of the guild. If the guild is uncached, this will be null
         */
        this.emit('guildStickersUpdate', guild ?? { id: packet.d.guild_id }, stickers, oldStickers);
        break;
      }
      case 'CHANNEL_PINS_UPDATE': {
        const channel = this.client.getChannel(packet.d.channel_id);
        if (!channel?.isTextBased()) {
          this.emit('debug', `CHANNEL_PINS_UPDATE target channel ${packet.d.channel_id} not found`);
          break;
        }
        const oldTimestamp = channel.lastPinTimestamp;
        channel.lastPinTimestamp = Date.parse(packet.d.last_pin_timestamp!);
        /**
         * Fired when a channel pin timestamp is updated
         * @event Client#channelPinUpdate
         * @prop {PrivateChannel | TextChannel | NewsChannel} channel The channel
         * @prop {Number} timestamp The new timestamp
         * @prop {Number} oldTimestamp The old timestamp
         */
        this.emit('channelPinUpdate', channel, channel.lastPinTimestamp, oldTimestamp);
        break;
      }
      case 'WEBHOOKS_UPDATE': {
        /**
         * Fired when a channel's webhooks are updated
         * @event Client#webhooksUpdate
         * @prop {Object} data The update data
         * @prop {String} data.channelID The ID of the channel that webhooks were updated in
         * @prop {String} data.guildID The ID of the guild that webhooks were updated in
         */
        this.emit('webhooksUpdate', {
          channelID: packet.d.channel_id,
          guildID: packet.d.guild_id
        });
        break;
      }
      case 'THREAD_CREATE': {
        const channel = ChannelFactory.create(packet.d, this.client);
        if (!channel.isThread() || !('guild_id' in packet.d)) break;
        channel.guild.threads.add(channel, this.client);
        this.client.threadGuildMap[packet.d.id] = packet.d.guild_id!;
        /**
         * Fired when a channel is created
         * @event Client#threadCreate
         * @prop {NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel} channel The channel
         */
        this.emit('threadCreate', channel);
        break;
      }
      case 'THREAD_UPDATE': {
        const channel = this.client.getChannel(packet.d.id);
        if (!channel && 'guild_id' in packet.d) {
          const thread = ChannelFactory.create(packet.d, this.client);
          this.emit('threadUpdate', this.client.guilds.get(packet.d.guild_id!)!.threads.add(thread, this.client), null);
          this.client.threadGuildMap[packet.d.id] = packet.d.guild_id!;
          break;
        }
        if (!channel?.isThread()) {
          this.emit('warn', `Unexpected THREAD_UPDATE for channel ${packet.d.id} with type ${packet.d.type}`);
          break;
        }
        const oldChannel = {
          name: channel.name,
          rateLimitPerUser: channel.rateLimitPerUser,
          threadMetadata: channel.threadMetadata
        };

        channel.update(packet.d);

        /**
         * Fired when a thread channel is updated
         * @event Client#threadUpdate
         * @prop {NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel} channel The updated channel
         * @prop {Object?} oldChannel The old thread channel. This will be null if the channel was uncached
         * @prop {String} oldChannel.name The name of the channel
         * @prop {Number} oldChannel.rateLimitPerUser The ratelimit of the channel, in seconds. 0 means no ratelimit is enabled
         * @prop {Object} oldChannel.threadMetadata Metadata for the thread
         * @prop {Number} oldChannel.threadMetadata.archiveTimestamp Timestamp when the thread's archive status was last changed, used for calculating recent activity
         * @prop {Boolean} oldChannel.threadMetadata.archived Whether the thread is archived
         * @prop {Number} oldChannel.threadMetadata.autoArchiveDuration Duration in minutes to automatically archive the thread after recent activity, either 60, 1440, 4320 or 10080
         * @prop {Boolean?} oldChannel.threadMetadata.locked Whether the thread is locked
         */
        this.emit('threadUpdate', channel, oldChannel);
        break;
      }
      case 'THREAD_DELETE': {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.client.threadGuildMap[packet.d.id];
        if (!('guild_id' in packet.d)) break;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const guild = this.client.guilds.get(packet.d.guild_id!);
        if (!guild) {
          this.emit('debug', `Missing guild ${packet.d.guild_id} in THREAD_DELETE`);
          break;
        }
        const channel = guild.threads.remove(packet.d);
        if (!channel) {
          break;
        }
        /**
         * Fired when a thread channel is deleted
         * @event Client#threadDelete
         * @prop {NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel} channel The channel
         */
        this.emit('threadDelete', channel);
        break;
      }
      case 'THREAD_LIST_SYNC': {
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('debug', `Missing guild ${packet.d.guild_id} in THREAD_LIST_SYNC`);
          break;
        }
        const deletedThreads = (packet.d.channel_ids ?? guild.threads.map((c) => c.id)).filter((c) => !packet.d.threads.some((t) => t.id === c)).map((id) => guild.threads.remove({ id }) ?? (ChannelFactory.create({ id }, this.client) as PartialChannel));
        const activeThreads = packet.d.threads.map((t) => guild.threads.update(t, this.client));
        // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
        const joinedThreadsMember = packet.d.members.map((m) => guild.threads.get(m.id!)!.members.update(m, this.client));
        /**
         * Fired when the current user gains access to a channel
         * @event Client#threadListSync
         * @prop {Guild} guild The guild where threads are being synced
         * @prop {Array<NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel | Object>} deletedThreads An array of synced threads that the current user no longer has access to. If a thread channel is uncached, it will be an object with an `id` key. No other property is guaranteed
         * @prop {Array<NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel>} activeThreads An array of synced active threads that the current user can access
         * @prop {Array<ThreadMember>} joinedThreadsMember An array of thread member objects where the current user has been added in a synced thread channel
         */
        this.emit('threadListSync', guild, deletedThreads, activeThreads, joinedThreadsMember);
        break;
      }
      case 'THREAD_MEMBER_UPDATE': {
        const channel = this.client.getChannel(packet.d.id!);
        if (!channel?.isThread()) {
          this.emit('debug', `Missing channel ${packet.d.id} in THREAD_MEMBER_UPDATE`);
          break;
        }
        let oldMember = null;
        const payload = packet.d as GatewayThreadMemberUpdateDispatchData & { id: string; thread_id: string };
        payload.thread_id = packet.d.id!;
        payload.id = packet.d.user_id!;
        let member = channel.members.get(payload.id);
        if (member) {
          oldMember = {
            flags: member.flags
          };
        }
        member = channel.members.update(payload, this.client);
        /**
         * Fired when a thread member is updated
         * @event Client#threadMemberUpdate
         * @prop {NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel} channel The channel
         * @prop {ThreadMember} member The updated thread member
         * @prop {Object} oldMember The old thread member data
         * @prop {Number} oldMember.flags User thread settings
         */
        this.emit('threadMemberUpdate', channel, member, oldMember);
        break;
      }
      case 'THREAD_MEMBERS_UPDATE': {
        const channel = this.client.getChannel(packet.d.id);
        if (!channel?.isThread()) {
          this.emit('debug', `Missing channel ${packet.d.id} in THREAD_MEMBERS_UPDATE`);
          break;
        }
        channel.update(packet.d);
        let addedMembers;
        let removedMembers;
        if (packet.d.added_members) {
          addedMembers = packet.d.added_members.map((m) => {
            // if (m.presence) {
            //   m.presence.id = m.presence.user.id;
            //   this.client.users.update(m.presence.user, this.client);
            // }

            // @ts-expect-error -- hate
            m.thread_id = m.id;
            m.id = m.user_id;
            // @ts-expect-error -- hate
            m.member.id = m.member.user.id;
            const guild = this.client.guilds.get(packet.d.guild_id);
            if (guild) {
              // if (m.presence) {
              //   guild.members.update(m.presence, guild);
              // }
              // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
              guild.members.update(m.member, guild);
            }
            // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
            return channel.members.update(m, this.client);
          });
        }
        if (packet.d.removed_member_ids) {
          removedMembers = packet.d.removed_member_ids.map((id) => channel.members.remove({ id }) ?? { id });
        }
        /**
         * Fired when anyone is added or removed from a thread. If the `guildMembers` intent is not specified, this will only apply for the current user
         * @event Client#threadMembersUpdate
         * @prop {NewsThreadChannel | PrivateThreadChannel | PublicThreadChannel} channel The thread channel
         * @prop {Array<ThreadMember>} addedMembers An array of members that were added to the thread channel
         * @prop {Array<ThreadMember | Object>} removedMembers An array of members that were removed from the thread channel. If a member is uncached, it will be an object with an `id` key. No other property is guaranteed
         */
        this.emit('threadMembersUpdate', channel, addedMembers ?? [], removedMembers ?? []);
        break;
      }
      case 'STAGE_INSTANCE_CREATE': {
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('debug', `Missing guild ${packet.d.guild_id} in STAGE_INSTANCE_CREATE`);
          break;
        }
        /**
         * Fired when a stage instance is created
         * @event Client#stageInstanceCreate
         * @prop {StageInstance} stageInstance The stage instance
         */
        this.emit('stageInstanceCreate', guild.stageInstances.add(packet.d, this.client));
        break;
      }
      case 'STAGE_INSTANCE_UPDATE': {
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('stageInstanceUpdate', packet.d, null);
          break;
        }
        const stageInstance = guild.stageInstances.get(packet.d.id);
        let oldStageInstance = null;
        if (stageInstance) {
          oldStageInstance = {
            privacyLevel: stageInstance.privacyLevel,
            topic: stageInstance.topic
          };
        }
        /**
         * Fired when a stage instance is updated
         * @event Client#stageInstanceUpdate
         * @prop {StageInstance} stageInstance The stage instance
         * @prop {Object?} oldStageInstance The old stage instance. If the stage instance was cached, this will be an object with the properties below. Otherwise, it will be null
         * @prop {Boolean} oldStageInstance.discoverableDisabled Whether or not stage discovery was disabled
         * @prop {Number} oldStageInstance.privacyLevel The privacy level of the stage instance. 1 is public, 2 is guild only
         * @prop {String} oldStageInstance.topic The stage instance topic
         */
        // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
        this.emit('stageInstanceUpdate', guild.stageInstances.update(packet.d, this.client), oldStageInstance);
        break;
      }
      case 'STAGE_INSTANCE_DELETE': {
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('stageInstanceDelete', new StageInstance(packet.d, this.client));
          break;
        }
        /**
         * Fired when a stage instance is deleted
         * @event Client#stageInstanceDelete
         * @prop {StageInstance} stageInstance The deleted stage instance
         */
        this.emit('stageInstanceDelete', guild.stageInstances.remove(packet.d) ?? new StageInstance(packet.d, this.client));
        break;
      }
      case 'GUILD_INTEGRATIONS_UPDATE': {
        break;
      }
      case 'INTERACTION_CREATE': {
        /**
         * Fired when an interaction is created
         * @event Client#interactionCreate
         * @prop {PingInteraction | CommandInteraction | ComponentInteraction | AutocompleteInteraction | ModalSubmitInteraction | UnknownInteraction} Interaction The Interaction that was created
         */
        this.emit('interactionCreate', InteractionFactory.create(packet.d, this.client));
        break;
      }
      case 'GUILD_AUDIT_LOG_ENTRY_CREATE': {
        const guild = this.client.guilds.get(packet.d.guild_id);
        if (!guild) {
          this.emit('debug', `Missing guild ${packet.d.guild_id} in GUILD_AUDIT_LOG_ENTRY_CREATE`);
          break;
        }

        /**
         * Fired when an guild autit log entry is created
         * @event Client#guildAuditLogEntryCreate
         * @prop {GuildAuditLogEntry} GuildAuditLogEntry The guild audit log entry that was created
         */
        this.emit('guildAuditLogEntryCreate', new GuildAuditLogEntry(packet.d, guild));
        break;
      }
      case GatewayDispatchEvents.EntitlementCreate: {
        this.emit('entitlementCreate', new Entitlement(packet.d, this.client));
        break;
      }
      case GatewayDispatchEvents.EntitlementUpdate: {
        this.emit('entitlementUpdate', new Entitlement(packet.d, this.client));
        break;
      }
      case GatewayDispatchEvents.EntitlementDelete: {
        this.emit('entitlementDelete', new Entitlement(packet.d, this.client));
        break;
      }
      case GatewayDispatchEvents.SubscriptionCreate: {
        this.emit('subscriptionCreate', new Subscription(packet.d, this.client));
        break;
      }
      case GatewayDispatchEvents.SubscriptionUpdate: {
        this.emit('subscriptionUpdate', new Subscription(packet.d, this.client));
        break;
      }
      case GatewayDispatchEvents.SubscriptionDelete: {
        this.emit('subscriptionDelete', new Subscription(packet.d, this.client));
        break;
      }
      default: {
        /**
         * Fired when the shard encounters an unknown packet
         * @event Client#unknown
         * @prop {Object} packet The unknown packet
         * @prop {Number} id The ID of the shard
         */
        this.emit('unknown', packet, this.id);
        break;
      }
    } /* eslint-enable no-redeclare */
  }

  _onWSClose(code: GatewayCloseCodes | 1000 | 4006 | 1006, reason: any) {
    reason = reason.toString();
    this.emit(
      'debug',
      'WS disconnected: ' +
        JSON.stringify({
          code,
          reason,
          status: this.status
        })
    );
    let err = !code || code === 1000 ? null : new Error(code + ': ' + reason);
    let reconnect: boolean | 'auto' = 'auto';
    if (code) {
      this.emit('debug', `${code === 1000 ? 'Clean' : 'Unclean'} WS close: ${code}: ${reason}`, this.id);
      if (code === 4001) {
        err = new Error('Gateway received invalid OP code');
      } else if (code === 4002) {
        err = new Error('Gateway received invalid message');
      } else if (code === 4003) {
        err = new Error('Not authenticated');
        this.sessionID = null;
        this.resumeURL = null;
      } else if (code === 4004) {
        err = new Error('Authentication failed');
        this.sessionID = null;
        this.resumeURL = null;
        reconnect = false;
        this.emit('error', new Error(`Invalid token: ${this._token}`));
      } else if (code === 4005) {
        err = new Error('Already authenticated');
      } else if (code === 4006 || code === 4009) {
        err = new Error('Invalid session');
        this.sessionID = null;
        this.resumeURL = null;
      } else if (code === 4007) {
        err = new Error('Invalid sequence number: ' + this.seq);
        this.seq = 0;
      } else if (code === 4008) {
        err = new Error('Gateway connection was ratelimited');
      } else if (code === 4010) {
        err = new Error('Invalid shard key');
        this.sessionID = null;
        this.resumeURL = null;
        reconnect = false;
      } else if (code === 4011) {
        err = new Error('Shard has too many guilds (>2500)');
        this.sessionID = null;
        this.resumeURL = null;
        reconnect = false;
      } else if (code === 4013) {
        throw new Error('Invalid intents specified');
      } else if (code === 4014) {
        throw new Error('Disallowed intents specified');
      } else if (code === 1006) {
        err = new Error('Connection reset by peer');
      } else if (code !== 1000 && reason) {
        err = new Error(code + ': ' + reason);
      }
      if (err) {
        // TODO: Make an error class for ws
        // @ts-expect-error -- ^
        err.code = code;
      }
    } else {
      this.emit('debug', 'WS close: unknown code: ' + reason, this.id);
    }
    this.disconnect(
      {
        reconnect
      },
      err
    );
  }

  _onWSError(err: any) {
    this.emit('error', err as Error, this.id);
  }

  _onWSMessage(data: RawData) {
    try {
      let buff: Buffer | null = data instanceof Buffer ? data : null;
      if (data instanceof ArrayBuffer) {
        if (this.client.options.compress) {
          buff = Buffer.from(data);
        }
      } else if (Array.isArray(data)) {
        // Fragmented messages
        buff = Buffer.concat(data.map((chunk) => new Uint8Array(chunk))); // Copyfull concat is slow, but no alternative
      }
      if (!buff) return;
      if (this.client.options.compress && this.zlib?.enabled) {
        if (buff.length >= 4 && buff.readUInt32BE(buff.length - 4) === 0xffff) {
          this.zlib.push(buff, true);
          if (this.zlib.err) {
            this.emit('error', new Error(`zlib error ${this.zlib.err}: ${this.zlib.msg}`));
            return;
          }
          const resultBuffer = this.zlib.consume();
          buff = Buffer.isBuffer(resultBuffer) ? resultBuffer : Buffer.from(resultBuffer as string);
          return this.onPacket(JSON.parse(buff.toString()) as GatewayReceivePayload);
        } else {
          this.zlib.push(buff, false);
        }
      } else {
        return this.onPacket(JSON.parse(buff.toString()) as GatewayReceivePayload);
      }
    } catch (err) {
      this.emit('error', err as Error, this.id);
    }
  }

  _onWSOpen() {
    this.status = 'handshaking';
    /**
     * Fired when the shard establishes a connection
     * @event Client#connect
     * @prop {Number} id The ID of the shard
     */
    this.emit('connect', this.id);
    this.lastHeartbeatAck = true;
  }

  [util.inspect.custom]() {
    return Base.prototype[util.inspect.custom].call(this);
  }

  toString() {
    return Base.prototype.toString.call(this);
  }

  toJSON(props = []) {
    return Base.prototype.toJSON.call(this, ['connecting', 'ready', 'discordServerTrace', 'status', 'lastHeartbeatReceived', 'lastHeartbeatSent', 'latency', 'preReady', 'getAllUsersCount', 'getAllUsersQueue', 'getAllUsersLength', 'guildSyncQueue', 'guildSyncQueueLength', 'unsyncedGuilds', 'lastHeartbeatAck', 'seq', 'sessionID', 'reconnectInterval', 'connectAttempts', ...props]);
  }
}
