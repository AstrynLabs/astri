import type { APIEntitlement, ClientContext } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import type { User } from './user';
import { parseTimestamp } from './util';

/** Access a user or guild has to one of the application's SKUs. */
export class Entitlement extends Base {
    readonly skuId: string;
    readonly applicationId: string;
    /** The user who has access. For guild subscriptions, the user who bought it. */
    readonly userId: string | null;
    /** Set when the whole guild has access. */
    readonly guildId: string | null;
    /** One of {@link EntitlementTypes}. */
    readonly type: number;
    deleted = false;
    /** Unix ms access starts, or `null` for test entitlements. */
    startsAt: number | null = null;
    /** Unix ms access ends, or `null` for test entitlements and ones that never end. */
    endsAt: number | null = null;
    /** One-time purchases only: whether {@link Entitlement.consume} was called. */
    consumed = false;

    constructor(client: ClientContext, data: APIEntitlement) {
        super(client, data.id);
        this.skuId = data.sku_id;
        this.applicationId = data.application_id;
        this.userId = data.user_id ?? null;
        this.guildId = data.guild_id ?? null;
        this.type = data.type;
        this.patch(data);
    }

    /** The user who has access, if cached. */
    get user(): User | undefined {
        return this.userId === null ? undefined : this.client.users.get(this.userId);
    }

    /** The guild that has access, if cached. */
    get guild(): Guild | undefined {
        return this.guildId === null ? undefined : this.client.guilds.get(this.guildId);
    }

    /** Whether the entitlement grants access right now. */
    get active(): boolean {
        if (this.deleted || this.consumed) return false;
        const now = Date.now();
        return (this.startsAt === null || this.startsAt <= now) && (this.endsAt === null || this.endsAt > now);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIEntitlement>): void {
        if (data.deleted !== undefined) this.deleted = data.deleted;
        if (data.starts_at !== undefined) this.startsAt = parseTimestamp(data.starts_at);
        if (data.ends_at !== undefined) this.endsAt = parseTimestamp(data.ends_at);
        if (data.consumed !== undefined) this.consumed = data.consumed;
    }

    /** Marks a one-time purchase as used up, for consumable SKUs. */
    async consume(): Promise<void> {
        await this.client.rest.post('applicationEntitlementConsume', this.applicationId, this.id);
        this.consumed = true;
    }

    /** Deletes a test entitlement. Real purchases cannot be deleted. */
    async delete(): Promise<void> {
        await this.client.rest.delete('applicationEntitlement', this.applicationId, this.id);
    }
}

/** The cached entitlement for `data.id` patched with `data`, or a new one, cached if the entitlements cache is enabled. */
export function upsertEntitlement(client: ClientContext, data: APIEntitlement): Entitlement {
    const cached = client.entitlements.get(data.id);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new Entitlement(client, data);
    client.entitlements.set(created.id, created);
    return created;
}
