import type { OverwriteTypes } from '../../constants';
import type { APIOverwrite } from '../../types';
import { Permission } from './permission';

/** Permissions a channel allows or denies a role or member, on top of what the guild gives them. */
export class PermissionOverwrite extends Permission {
    /** Role or user id. */
    readonly id: string;
    readonly type: OverwriteTypes;

    constructor(data: APIOverwrite) {
        super(data.allow, data.deny);
        this.id = data.id;
        this.type = data.type;
    }

    override toJSON(): { id: string; type: OverwriteTypes; allow: string; deny: string } {
        return { id: this.id, type: this.type, ...super.toJSON() };
    }
}
