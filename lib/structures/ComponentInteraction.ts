'use strict';

import Interaction from './Interaction';
import Message from './Message';
import { ComponentType, type APIMessageComponentInteraction, type APIMessageComponentInteractionData, InteractionResponseType } from 'discord-api-types/v10';
import type Client from '../Client';
import { type TextBasedChannel } from '../interfaces/Types';
import ChannelFactory from '../factories/ChannelFactory';
import type Guild from './Guild';
import type Member from './Member';
import User from './User';
import PermissionBitfield from '../util/PermissionBitfield';
import Collection from '../util/Collection';
import BaseChannel from './BaseChannel';
import Role from './Role';

export type StringSelectMenuInteraction = Omit<ComponentInteraction, 'selected'> & { selected: string[] };
export type ChannelSelectMenuInteraction = Omit<ComponentInteraction, 'selected'> & { selected: Collection<BaseChannel> };
export type RoleSelectMenuInteraction = Omit<ComponentInteraction, 'selected'> & { selected: Collection<Role> };
export type UserSelectMenuInteraction = Omit<ComponentInteraction, 'selected'> & { selected: Collection<User> };
export type MentionableSelectMenuInteraction = Omit<ComponentInteraction, 'selected'> & { selected: Array<User | Member | Role> };

export default class ComponentInteraction extends Interaction {
  channel: TextBasedChannel;
  guild: Guild | null = null;
  member: Member | null = null;
  user?: User | null = null;
  message: Message | null = null;
  data: APIMessageComponentInteractionData;
  appPermissions: PermissionBitfield;
  selected: any;
  constructor(data: APIMessageComponentInteraction, client: Client) {
    super(data, client);

    this.data = data.data;
    this.channel = (this._client.getChannel(data.channel.id) ?? ChannelFactory.create({ id: data.channel.id }, client)) as TextBasedChannel;
    this.guild = client.guilds.get(data.guild_id!) ?? null;

    if (data.member !== undefined) {
      if (this.guild) {
        // @ts-expect-error -- id
        data.member.id = data.member.user.id;
        // @ts-expect-error -- I tried for hours trying to type this shit to the first arg of the constructor
        this.member = this.guild.members.update(data.member, this.guild);
      }
    }

    if (data.message !== undefined) {
      this.message = new Message(data.message, this._client);
    }

    if (data.user !== undefined) {
      this.user = this._client.users.update(data.user, client);
    }

    this.appPermissions = new PermissionBitfield(data.app_permissions);

    if ('values' in data.data) {
      switch (data.data.component_type) {
        case ComponentType.StringSelect:
          this.selected = data.data.values;
          break;
        case ComponentType.ChannelSelect: {
          const channelMap = new Collection(BaseChannel);
          Object.entries(data.data.resolved.channels).forEach(([id, channel]) => {
            channelMap.set(id, this.guild?.channels.update(channel, this._client) ?? ChannelFactory.create(channel, this._client));
          });
          this.selected = channelMap;
          break;
        }
        case ComponentType.RoleSelect: {
          const roleMap = new Collection(Role);
          Object.entries(data.data.resolved.roles).forEach(([id, role]) => {
            roleMap.set(id, this.guild?.roles.update(role, this.guild) ?? new Role(role, this.guild));
          });
          this.selected = roleMap;
          break;
        }
        case ComponentType.UserSelect: {
          const usermap = new Collection(User);
          Object.entries(data.data.resolved.users).forEach(([id, user]) => {
            usermap.set(id, this._client.users.update(user, client));
          });
          this.selected = usermap;
          break;
        }
        case ComponentType.MentionableSelect: {
          const a = [];
          if (data.data.resolved.members && this.guild) a.push(...Object.entries(data.data.resolved.members).map(([id, user]) => this.guild?.members.update({ ...user, id }, this.guild)));
          if (data.data.resolved.users) a.push(...Object.entries(data.data.resolved.users).map(([id, user]) => this._client.users.update(user, client)));
          if (data.data.resolved.roles && this.guild) a.push(...Object.entries(data.data.resolved.roles).map(([id, role]) => this.guild?.roles.update(role, this.guild) ?? new Role(role, this.guild)));
          this.selected = a;
          break;
        }
      }
    }
  }

  isStringSelect(): this is StringSelectMenuInteraction {
    return this.data.component_type === ComponentType.StringSelect;
  }

  isChannelSelect(): this is StringSelectMenuInteraction {
    return this.data.component_type === ComponentType.ChannelSelect;
  }

  isRoleSelect(): this is RoleSelectMenuInteraction {
    return this.data.component_type === ComponentType.RoleSelect;
  }

  isUserSelect(): this is UserSelectMenuInteraction {
    return this.data.component_type === ComponentType.UserSelect;
  }

  isMentionableSelect(): this is MentionableSelectMenuInteraction {
    return this.data.component_type === ComponentType.MentionableSelect;
  }

  isButton() {
    return this.data.component_type === ComponentType.Button;
  }

  /**
   * Acknowledge the component interaction and edit the message component is attached to later
   *
   * @return {*}
   * @memberof ComponentInteraction
   */
  deferUpdate() {
    if (this.acknowledged) {
      throw new Error('You have already acknowledged this interaction.');
    }
    return this._client
      .createInteractionResponse(this.id, this.token, {
        type: InteractionResponseType.DeferredMessageUpdate
      })
      .then(() => this.update());
  }
}
