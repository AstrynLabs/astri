import type { ChannelTypes } from '../../../constants';
import type { PermissionOverwrite } from '../../../interfaces';
import type { APIChannel, APIOverwrite, ClientContext } from '../../../types';
import type { Guild } from '../guild';
import { Channel } from './channel';

/** Any channel that belongs to a guild. */
export abstract class GuildChannel extends Channel {
    readonly guildId: string;
    name: string;
    position = 0;
    permissionOverwrites: PermissionOverwrite[] = [];
    /** Category id. */
    parentId: string | null = null;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data);
        this.guildId = guildId;
    }

    /** The guild this channel belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    override patch(data: Partial<APIChannel>): void {
        super.patch(data);
        if (typeof data.name === 'string') this.name = data.name;
        if (data.position !== undefined) this.position = data.position;
        if (data.permission_overwrites !== undefined) this.permissionOverwrites = data.permission_overwrites.map(toOverwrite);
        if (data.parent_id !== undefined) this.parentId = data.parent_id;
    }
}

export class CategoryChannel extends GuildChannel {
    declare readonly type: typeof ChannelTypes.GuildCategory;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}

/** The channel in a hub guild that lists the hub's member servers. */
export class DirectoryChannel extends GuildChannel {
    declare readonly type: typeof ChannelTypes.GuildDirectory;

    constructor(client: ClientContext, data: APIChannel, guildId: string) {
        super(client, data, guildId);
        this.patch(data);
    }
}

function toOverwrite(data: APIOverwrite): PermissionOverwrite {
    return { id: data.id, type: data.type, allow: BigInt(data.allow), deny: BigInt(data.deny) };
}
