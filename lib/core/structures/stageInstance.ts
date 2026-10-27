import type { StageInstancePrivacyLevels } from '../../constants';
import type { APIStageInstance, ClientContext, StageInstanceEditData } from '../../types';
import { Base } from './base';
import type { StageChannel } from './channels';
import type { Guild } from './guild';
import type { GuildScheduledEvent } from './scheduledEvent';

/** A live stage: the topic and settings of a stage channel while someone is speaking in it. */
export class StageInstance extends Base {
    readonly guildId: string;
    readonly channelId: string;
    topic: string;
    privacyLevel: StageInstancePrivacyLevels;
    /** Whether the stage is hidden from stage discovery. */
    discoverableDisabled = false;
    /** The event the stage was started for, if any. */
    scheduledEventId: string | null = null;

    constructor(client: ClientContext, data: APIStageInstance) {
        super(client, data.id);
        this.guildId = data.guild_id;
        this.channelId = data.channel_id;
        this.patch(data);
    }

    /** The guild, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** The stage channel, if cached. */
    get channel(): StageChannel | undefined {
        return this.guild?.channels.get(this.channelId) as StageChannel | undefined;
    }

    /** The event the stage was started for, if any and cached. */
    get scheduledEvent(): GuildScheduledEvent | undefined {
        return this.scheduledEventId === null ? undefined : this.guild?.scheduledEvents.get(this.scheduledEventId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIStageInstance>): void {
        if (data.topic !== undefined) this.topic = data.topic;
        if (data.privacy_level !== undefined) this.privacyLevel = data.privacy_level;
        if (data.discoverable_disabled !== undefined) this.discoverableDisabled = data.discoverable_disabled;
        if (data.guild_scheduled_event_id !== undefined) this.scheduledEventId = data.guild_scheduled_event_id;
    }

    /** Needs to be a stage moderator: the manage channels, mute members and move members permissions. */
    async edit(data: StageInstanceEditData, reason?: string): Promise<this> {
        this.patch(await this.client.rest.patch('stageInstance', this.channelId, data, reason));
        return this;
    }

    /** Ends the stage. Needs to be a stage moderator: the manage channels, mute members and move members permissions. */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete('stageInstance', this.channelId, reason);
    }
}

/** The cached stage instance for `data.id` patched with `data`, or a new one, cached if its guild is. */
export function upsertStageInstance(client: ClientContext, data: APIStageInstance): StageInstance {
    const stageInstances = client.guilds.get(data.guild_id)?.stageInstances;
    const cached = stageInstances?.get(data.id);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new StageInstance(client, data);
    stageInstances?.set(created.id, created);
    return created;
}
