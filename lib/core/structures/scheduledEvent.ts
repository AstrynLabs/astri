import { GuildScheduledEventStatuses, type GuildScheduledEventPrivacyLevels } from '../../constants';
import type { RecurrenceRule } from '../../interfaces';
import type { APIGuildScheduledEvent, ClientContext, GuildScheduledEventEditData } from '../../types';
import { Base } from './base';
import type { Channel } from './channels';
import type { Guild } from './guild';
import { upsertUser, type User } from './user';
import { parseTimestamp, toRecurrenceRule } from './util';

/** An event scheduled in a guild, held in a stage or voice channel, or somewhere else. */
export class GuildScheduledEvent extends Base {
    readonly guildId: string;
    /** `null` for external events. */
    channelId: string | null = null;
    /** `null` for events created before 2021-10-25. */
    creatorId: string | null = null;
    /** Only known when Discord sends it. */
    creator: User | null = null;
    name: string;
    description: string | null = null;
    /** Unix ms. */
    startsAt: number;
    /** Unix ms, or `null`. Always set for external events. */
    endsAt: number | null = null;
    privacyLevel: GuildScheduledEventPrivacyLevels;
    status: GuildScheduledEventStatuses;
    /** One of {@link GuildScheduledEventEntityTypes}. */
    entityType: number;
    entityId: string | null = null;
    /** External events only: where it takes place. */
    location: string | null = null;
    /** Users subscribed to the event. Kept current by user add and remove events once known. */
    userCount: number | null = null;
    /** Cover image hash. */
    image: string | null = null;
    /** `null` if the event does not repeat. */
    recurrenceRule: RecurrenceRule | null = null;

    constructor(client: ClientContext, data: APIGuildScheduledEvent) {
        super(client, data.id);
        this.guildId = data.guild_id;
        this.patch(data);
    }

    /** The guild the event belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** The stage or voice channel the event is held in, if cached. */
    get channel(): Channel | undefined {
        return this.channelId === null ? undefined : this.guild?.channels.get(this.channelId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIGuildScheduledEvent>): void {
        if (data.channel_id !== undefined) this.channelId = data.channel_id;
        if (data.creator_id !== undefined) this.creatorId = data.creator_id;
        if (data.creator !== undefined) this.creator = upsertUser(this.client, data.creator);
        if (data.name !== undefined) this.name = data.name;
        if (data.description !== undefined) this.description = data.description;
        if (data.scheduled_start_time !== undefined) this.startsAt = Date.parse(data.scheduled_start_time);
        if (data.scheduled_end_time !== undefined) this.endsAt = parseTimestamp(data.scheduled_end_time);
        if (data.privacy_level !== undefined) this.privacyLevel = data.privacy_level;
        if (data.status !== undefined) this.status = data.status;
        if (data.entity_type !== undefined) this.entityType = data.entity_type;
        if (data.entity_id !== undefined) this.entityId = data.entity_id;
        if (data.entity_metadata !== undefined) this.location = data.entity_metadata?.location ?? null;
        if (data.user_count !== undefined) this.userCount = data.user_count;
        if (data.image !== undefined) this.image = data.image;
        if (data.recurrence_rule !== undefined) this.recurrenceRule = data.recurrence_rule === null ? null : toRecurrenceRule(data.recurrence_rule);
    }

    /** Needs the manage events permission, or create events for events the client created. */
    async edit(data: GuildScheduledEventEditData, reason?: string): Promise<this> {
        this.patch(await this.client.rest.patch('guildScheduledEvent', this.guildId, this.id, data, reason));
        return this;
    }

    /** Needs the manage events permission, or create events for events the client created. */
    async delete(): Promise<void> {
        await this.client.rest.delete('guildScheduledEvent', this.guildId, this.id);
    }

    /** Starts a scheduled event. */
    start(reason?: string): Promise<this> {
        return this.edit({ status: GuildScheduledEventStatuses.Active }, reason);
    }

    /** Ends an active event. */
    end(reason?: string): Promise<this> {
        return this.edit({ status: GuildScheduledEventStatuses.Completed }, reason);
    }

    /** Cancels an event that has not started. */
    cancel(reason?: string): Promise<this> {
        return this.edit({ status: GuildScheduledEventStatuses.Canceled }, reason);
    }
}

/** The cached event for `data.id` patched with `data`, or a new one, cached if its guild is. */
export function upsertScheduledEvent(client: ClientContext, data: APIGuildScheduledEvent): GuildScheduledEvent {
    const events = client.guilds.get(data.guild_id)?.scheduledEvents;
    const cached = events?.get(data.id);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new GuildScheduledEvent(client, data);
    events?.set(created.id, created);
    return created;
}
