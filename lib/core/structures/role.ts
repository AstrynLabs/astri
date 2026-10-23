import type { APIRole, ClientContext } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';

export class Role extends Base {
    readonly guildId: string;
    name: string;
    color: number;
    hoist: boolean;
    icon: string | null = null;
    unicodeEmoji: string | null = null;
    position: number;
    permissions: bigint;
    managed: boolean;
    mentionable: boolean;
    flags: number;

    constructor(client: ClientContext, data: APIRole, guildId: string) {
        super(client, data.id);
        this.guildId = guildId;
        this.patch(data);
    }

    /** The guild this role belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIRole>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.color !== undefined) this.color = data.color;
        if (data.hoist !== undefined) this.hoist = data.hoist;
        if (data.icon !== undefined) this.icon = data.icon;
        if (data.unicode_emoji !== undefined) this.unicodeEmoji = data.unicode_emoji;
        if (data.position !== undefined) this.position = data.position;
        if (data.permissions !== undefined) this.permissions = BigInt(data.permissions);
        if (data.managed !== undefined) this.managed = data.managed;
        if (data.mentionable !== undefined) this.mentionable = data.mentionable;
        if (data.flags !== undefined) this.flags = data.flags;
    }
}
