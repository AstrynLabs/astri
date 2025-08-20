import type { APIChannel, APIDMChannel, APIGroupDMChannel, OverwriteType, RESTPatchAPIChannelJSONBody, RESTPostAPIChannelInviteJSONBody } from 'discord-api-types/v10';
import BaseChannel from './BaseChannel';
import type Client from '../Client';
import type Guild from './Guild';
import PermissionOverwrite from './PermissionOverwrite';
import Collection from '../util/Collection';
import Member from './Member';
import PermissionBitfield from '../util/PermissionBitfield';

export default class GuildChannel extends BaseChannel {
  guild: Guild;
  name: string;
  position: number;
  parentID?: string | null;
  nsfw?: boolean;
  permissionOverwrites = new Collection(PermissionOverwrite);
  topic?: string | null;
  constructor(data: Exclude<APIChannel, APIDMChannel | APIGroupDMChannel>, client: Client) {
    super(data, client);

    this.guild = this.client.guilds.get(data.guild_id!)!;
  }

  update(data: Exclude<APIChannel, APIDMChannel | APIGroupDMChannel>) {
    super.update(data);
    if (data.type) this.type = data.type;
    if (data.name) this.name = data.name;
    if (data.position) this.position = data.position;
    if (data.parent_id) this.parentID = data.parent_id;
    if (data.nsfw) this.nsfw = data.nsfw;
    if (data.permission_overwrites) {
      this.permissionOverwrites = new Collection(PermissionOverwrite);
      data.permission_overwrites.forEach((overwrite) => this.permissionOverwrites.add(overwrite));
    }
    if ('topic' in data) {
      this.topic = data.topic;
    }
  }

  deletePermission(overwriteID: string, reason?: string) {
    return this.client.deleteChannelPermission(this.id, overwriteID, reason);
  }

  edit(options: RESTPatchAPIChannelJSONBody, reason?: string) {
    return this.client.editChannel(this.id, options, reason);
  }

  editPermission(overwriteID: string, allow: bigint | number, deny: bigint | number, type: OverwriteType, reason?: string) {
    return this.client.editChannelPermission(this.id, overwriteID, allow, deny, type, reason);
  }

  permissionsOf(memberID: string | Member): PermissionBitfield {
    const member = memberID instanceof Member ? memberID : this.guild.members.get(memberID)!;
    const permission = this.guild.permissionsOf(member);
    if (permission.isAdmin()) return new PermissionBitfield(PermissionBitfield.all);

    const calculated = new PermissionBitfield(permission.bits);

    const channel = this.isThread() ? this.guild.channels.get(this.parentID!) : this;
    let overwrite = channel?.permissionOverwrites.get(this.guild.id);
    if (overwrite) {
      calculated.remove(overwrite.deny);
      calculated.add(overwrite.allow);
    }

    for (const roleID of member.roles) {
      if ((overwrite = channel?.permissionOverwrites.get(roleID))) {
        calculated.remove(overwrite.deny);
        calculated.add(overwrite.allow);
      }
    }

    overwrite = channel?.permissionOverwrites.get(member.id);
    if (overwrite) {
      calculated.remove(overwrite.deny);
      calculated.add(overwrite.allow);
    }
    return calculated;
  }

  createInvite(options: RESTPostAPIChannelInviteJSONBody, reason?: string) {
    return this.client.createChannelInvite(this.id, options, reason);
  }

  getInvites() {
    return this.client.getChannelInvites(this.id);
  }
}
