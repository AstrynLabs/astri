import type { AutoModerationEventTypes, AutoModerationTriggerTypes } from '../../constants';
import type { AutoModerationAction, AutoModerationTriggerMetadata } from '../../interfaces';
import type { APIAutoModerationRule, AutoModerationRuleEditData, ClientContext } from '../../types';
import { Base } from './base';
import type { Guild } from './guild';
import { toAutoModerationAction, toTriggerMetadata } from './util';

/** A guild's auto moderation rule. Rules need the auto moderation configuration intent to arrive through events. */
export class AutoModerationRule extends Base {
    readonly guildId: string;
    readonly creatorId: string;
    readonly triggerType: AutoModerationTriggerTypes;
    name: string;
    eventType: AutoModerationEventTypes;
    triggerMetadata: AutoModerationTriggerMetadata;
    actions: AutoModerationAction[] = [];
    enabled = false;
    /** Roles the rule does not apply to. */
    exemptRoles: string[] = [];
    /** Channels the rule does not apply in. */
    exemptChannels: string[] = [];

    constructor(client: ClientContext, data: APIAutoModerationRule) {
        super(client, data.id);
        this.guildId = data.guild_id;
        this.creatorId = data.creator_id;
        this.triggerType = data.trigger_type;
        this.patch(data);
    }

    /** The guild the rule belongs to, if cached. */
    get guild(): Guild | undefined {
        return this.client.guilds.get(this.guildId);
    }

    /** Applies a payload. Fields missing from `data` keep their current value. */
    patch(data: Partial<APIAutoModerationRule>): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.event_type !== undefined) this.eventType = data.event_type;
        if (data.trigger_metadata !== undefined) this.triggerMetadata = toTriggerMetadata(data.trigger_metadata);
        if (data.actions !== undefined) this.actions = data.actions.map(toAutoModerationAction);
        if (data.enabled !== undefined) this.enabled = data.enabled;
        if (data.exempt_roles !== undefined) this.exemptRoles = data.exempt_roles;
        if (data.exempt_channels !== undefined) this.exemptChannels = data.exempt_channels;
    }

    /** Needs the manage guild permission. */
    async edit(data: AutoModerationRuleEditData, reason?: string): Promise<this> {
        this.patch(await this.client.rest.patch('guildAutoModerationRule', this.guildId, this.id, data, reason));
        return this;
    }

    /** Needs the manage guild permission. */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete('guildAutoModerationRule', this.guildId, this.id, reason);
    }
}

/** The cached rule for `data.id` patched with `data`, or a new one, cached if its guild is. */
export function upsertAutoModerationRule(client: ClientContext, data: APIAutoModerationRule): AutoModerationRule {
    const rules = client.guilds.get(data.guild_id)?.autoModerationRules;
    const cached = rules?.get(data.id);
    if (cached !== undefined) {
        cached.patch(data);
        return cached;
    }
    const created = new AutoModerationRule(client, data);
    rules?.set(created.id, created);
    return created;
}
