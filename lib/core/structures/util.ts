import type { Activity, ApplicationCommandOption, AuditLogChange, AutoModerationAction, AutoModerationActionExecution, AutoModerationTriggerMetadata, ClientStatus, EmbedMedia, GuildApplicationCommandPermissions, GuildAuditLog, GuildBan, IntegrationApplication, InviteGuild, MessageReaction, PinnedMessages, Poll, ReactionEmoji, RecurrenceRule, Subscription, VoiceChannelEffect } from '../../interfaces';
import type {
    APIActivity,
    APIApplicationCommandOption,
    APIAutoModerationAction,
    APIAutoModerationTriggerMetadata,
    APIClientStatus,
    APIEmbed,
    APIGuildApplicationCommandPermissions,
    APIApplicationCommand,
    APIAuditLogEntry,
    APIAutoModerationRule,
    APIChannel,
    APIGuildAuditLog,
    APIGuildBan,
    APIGuildScheduledEvent,
    APIIntegration,
    APIUser,
    APIWebhook,
    APIIntegrationApplication,
    APIInviteGuild,
    APIMessageReaction,
    APIPoll,
    APIReactionEmoji,
    APIRecurrenceRule,
    APISubscription,
    ClientContext,
    EmojiResolvable,
    GatewayAutoModerationActionExecutionData,
    GatewayVoiceChannelEffectSendData,
    MessageCreateData,
    MessageFetchOptions,
    PermissionResolvable,
    PinFetchOptions,
    RESTFile,
    TextBasedChannel
} from '../../types';
import { ALL_PERMISSIONS, OverwriteTypes, Permissions, TIMED_OUT_PERMISSIONS } from '../../constants';
import { ApplicationCommand } from './applicationCommand';
import { upsertAutoModerationRule } from './autoModerationRule';
import { upsertThread, type GuildChannel } from './channels';
import { GuildAuditLogEntry } from './guildAuditLogEntry';
import { GuildIntegration } from './guildIntegration';
import type { Guild } from './guild';
import type { Member } from './member';
import { upsertMessage, type Message } from './message';
import { upsertScheduledEvent } from './scheduledEvent';
import { upsertUser } from './user';
import { Webhook } from './webhook';

export function parseTimestamp(value: string | null): number | null {
    return value === null ? null : Date.parse(value);
}

export function splitFiles<T extends { files?: RESTFile[] }>(data: string | T): [body: Omit<T, 'files'>, files: RESTFile[] | undefined] {
    if (typeof data === 'string') return [{ content: data } as unknown as Omit<T, 'files'>, undefined];
    const { files, ...body } = data;
    return [body, files];
}

/** The cached channel or thread `channelId` if it holds messages. DM channels are never cached, so `undefined` for them. */
export function getTextChannel(client: ClientContext, channelId: string, guildId: string | null): TextBasedChannel | undefined {
    if (guildId === null) return undefined;
    const guild = client.guilds.get(guildId);
    const channel = guild?.channels.get(channelId) ?? guild?.threads.get(channelId);
    return channel !== undefined && 'messages' in channel ? (channel as TextBasedChannel) : undefined;
}

/** The key a reaction with `emoji` is stored under in {@link Message.reactions}. */
export function reactionKey(emoji: APIReactionEmoji | ReactionEmoji): string {
    return emoji.id ?? emoji.name ?? '';
}

export function toReactionEmoji(data: APIReactionEmoji): ReactionEmoji {
    return { id: data.id, name: data.name, animated: data.animated ?? false };
}

export function toReaction(data: APIMessageReaction): MessageReaction {
    return {
        emoji: toReactionEmoji(data.emoji),
        count: data.count,
        normalCount: data.count_details.normal,
        burstCount: data.count_details.burst,
        me: data.me,
        meBurst: data.me_burst,
        burstColors: data.burst_colors
    };
}

export function toPoll(data: APIPoll): Poll {
    const counts = new Map(data.results?.answer_counts.map((entry) => [entry.id, entry]));
    return {
        question: data.question.text ?? '',
        answers: data.answers.map((answer) => ({
            id: answer.answer_id,
            text: answer.poll_media.text ?? null,
            emoji: answer.poll_media.emoji === undefined ? null : toReactionEmoji(answer.poll_media.emoji),
            voteCount: counts.get(answer.answer_id)?.count ?? 0,
            meVoted: counts.get(answer.answer_id)?.me_voted ?? false
        })),
        expiresAt: parseTimestamp(data.expiry ?? null),
        allowMultiselect: data.allow_multiselect,
        layoutType: data.layout_type,
        finalized: data.results?.is_finalized ?? false
    };
}

export function emojiParam(emoji: EmojiResolvable): string {
    if (typeof emoji === 'string') return emoji;
    return emoji.id === null ? (emoji.name ?? '') : `${emoji.name ?? '_'}:${emoji.id}`;
}

/** Counts one user's reaction on a message. `self` is whether the user is the client's own. */
export function applyReactionAdd(message: Message, emoji: APIReactionEmoji, burst: boolean, burstColors: string[], self: boolean): MessageReaction {
    const key = reactionKey(emoji);
    let reaction = message.reactions.get(key);
    if (reaction === undefined) {
        reaction = { emoji: toReactionEmoji(emoji), count: 0, normalCount: 0, burstCount: 0, me: false, meBurst: false, burstColors: [] };
        message.reactions.set(key, reaction);
    }
    reaction.count++;
    if (burst) {
        reaction.burstCount++;
        if (burstColors.length > 0) reaction.burstColors = burstColors;
        if (self) reaction.meBurst = true;
    } else {
        reaction.normalCount++;
        if (self) reaction.me = true;
    }
    return reaction;
}

/** Uncounts one user's reaction on a message, dropping the reaction once nobody is left. `self` is whether the user is the client's own. */
export function applyReactionRemove(message: Message, emoji: APIReactionEmoji, burst: boolean, self: boolean): MessageReaction | null {
    const key = reactionKey(emoji);
    const reaction = message.reactions.get(key);
    if (reaction === undefined) return null;
    reaction.count = Math.max(0, reaction.count - 1);
    if (burst) {
        reaction.burstCount = Math.max(0, reaction.burstCount - 1);
        if (self) reaction.meBurst = false;
    } else {
        reaction.normalCount = Math.max(0, reaction.normalCount - 1);
        if (self) reaction.me = false;
    }
    if (reaction.count === 0) message.reactions.delete(key);
    return reaction;
}

/** Counts (`delta` 1) or uncounts (`delta` -1) one user's vote on a message's poll. `self` is whether the user is the client's own. */
export function applyPollVote(message: Message, answerId: number, delta: 1 | -1, self: boolean): void {
    const answer = message.poll?.answers.find((candidate) => candidate.id === answerId);
    if (answer === undefined) return;
    answer.voteCount = Math.max(0, answer.voteCount + delta);
    if (self) answer.meVoted = delta === 1;
}

export function toEmbedMedia(data: NonNullable<APIEmbed['image'] | APIEmbed['video'] | APIEmbed['audio']>): EmbedMedia {
    return {
        url: data.url ?? null,
        proxyURL: data.proxy_url ?? null,
        width: 'width' in data ? (data.width ?? null) : null,
        height: 'height' in data ? (data.height ?? null) : null,
        contentType: data.content_type ?? null,
        description: data.description ?? null,
        flags: 'flags' in data ? (data.flags ?? 0) : 0
    };
}

export function toActivity(data: APIActivity): Activity {
    return {
        name: data.name,
        type: data.type,
        url: data.url ?? null,
        createdAt: data.created_at,
        startedAt: data.timestamps?.start ?? null,
        endsAt: data.timestamps?.end ?? null,
        applicationId: data.application_id ?? null,
        statusDisplayType: data.status_display_type ?? null,
        details: data.details ?? null,
        detailsURL: data.details_url ?? null,
        state: data.state ?? null,
        stateURL: data.state_url ?? null,
        emoji: data.emoji == null ? null : { name: data.emoji.name, id: data.emoji.id ?? null, animated: data.emoji.animated ?? false },
        partyId: data.party?.id ?? null,
        partySize: data.party?.size ?? null,
        assets:
            data.assets === undefined
                ? null
                : {
                      largeImage: data.assets.large_image ?? null,
                      largeText: data.assets.large_text ?? null,
                      largeURL: data.assets.large_url ?? null,
                      smallImage: data.assets.small_image ?? null,
                      smallText: data.assets.small_text ?? null,
                      smallURL: data.assets.small_url ?? null
                  },
        instance: data.instance ?? false,
        flags: data.flags ?? 0,
        buttons: data.buttons ?? []
    };
}

export function toClientStatus(data: APIClientStatus): ClientStatus {
    return { desktop: data.desktop ?? null, mobile: data.mobile ?? null, web: data.web ?? null };
}

export function toRecurrenceRule(data: APIRecurrenceRule): RecurrenceRule {
    return {
        start: Date.parse(data.start),
        end: parseTimestamp(data.end ?? null),
        frequency: data.frequency,
        interval: data.interval,
        byWeekday: data.by_weekday,
        byNWeekday: data.by_n_weekday,
        byMonth: data.by_month,
        byMonthDay: data.by_month_day,
        byYearDay: data.by_year_day ?? null,
        count: data.count ?? null
    };
}

export function toTriggerMetadata(data: APIAutoModerationTriggerMetadata): AutoModerationTriggerMetadata {
    return {
        keywordFilter: data.keyword_filter ?? [],
        regexPatterns: data.regex_patterns ?? [],
        presets: data.presets ?? [],
        allowList: data.allow_list ?? [],
        mentionTotalLimit: data.mention_total_limit ?? null,
        mentionRaidProtectionEnabled: data.mention_raid_protection_enabled ?? false
    };
}

export function toAutoModerationAction(data: APIAutoModerationAction): AutoModerationAction {
    return {
        type: data.type,
        channelId: data.metadata?.channel_id ?? null,
        durationSeconds: data.metadata?.duration_seconds ?? null,
        customMessage: data.metadata?.custom_message ?? null
    };
}

export function toActionExecution(data: GatewayAutoModerationActionExecutionData): AutoModerationActionExecution {
    return {
        guildId: data.guild_id,
        action: toAutoModerationAction(data.action),
        ruleId: data.rule_id,
        ruleTriggerType: data.rule_trigger_type,
        userId: data.user_id,
        channelId: data.channel_id ?? null,
        messageId: data.message_id ?? null,
        alertSystemMessageId: data.alert_system_message_id ?? null,
        content: data.content,
        matchedKeyword: data.matched_keyword,
        matchedContent: data.matched_content
    };
}

export function toCommandOption(data: APIApplicationCommandOption): ApplicationCommandOption {
    return {
        type: data.type,
        name: data.name,
        nameLocalizations: data.name_localizations ?? null,
        description: data.description,
        descriptionLocalizations: data.description_localizations ?? null,
        required: data.required ?? false,
        choices: data.choices?.map((choice) => ({ name: choice.name, nameLocalizations: choice.name_localizations ?? null, value: choice.value })) ?? [],
        options: data.options?.map(toCommandOption) ?? [],
        channelTypes: data.channel_types ?? [],
        minValue: data.min_value ?? null,
        maxValue: data.max_value ?? null,
        minLength: data.min_length ?? null,
        maxLength: data.max_length ?? null,
        autocomplete: data.autocomplete ?? false
    };
}

export function toCommandPermissions(data: APIGuildApplicationCommandPermissions): GuildApplicationCommandPermissions {
    return {
        id: data.id,
        applicationId: data.application_id,
        guildId: data.guild_id,
        permissions: data.permissions.map((permission) => ({ id: permission.id, type: permission.type, permission: permission.permission }))
    };
}

export function toInviteGuild(data: APIInviteGuild): InviteGuild {
    return {
        id: data.id,
        name: data.name,
        icon: data.icon,
        splash: data.splash,
        banner: data.banner,
        description: data.description,
        features: data.features,
        verificationLevel: data.verification_level,
        vanityURLCode: data.vanity_url_code,
        nsfwLevel: data.nsfw_level,
        premiumSubscriptionCount: data.premium_subscription_count
    };
}

/** Sends a message to a channel, thread or DM. */
export async function sendMessage(client: ClientContext, channelId: string, guildId: string | null, data: string | MessageCreateData): Promise<Message> {
    const [body, files] = splitFiles(data);
    return upsertMessage(client, await client.rest.post('channelMessage', channelId, body, { files }), guildId);
}

export async function fetchMessage(client: ClientContext, channelId: string, guildId: string | null, messageId: string): Promise<Message> {
    return upsertMessage(client, await client.rest.get('channelMessage', channelId, messageId), guildId);
}

export async function fetchMessages(client: ClientContext, channelId: string, guildId: string | null, options: MessageFetchOptions = {}): Promise<Message[]> {
    const messages = await client.rest.get('channelMessages', channelId, options);
    return (messages ?? []).map((message) => upsertMessage(client, message, guildId));
}

export async function fetchPins(client: ClientContext, channelId: string, guildId: string | null, options: PinFetchOptions = {}): Promise<PinnedMessages> {
    const pins = await client.rest.get('channelMessagesPins', channelId, options);
    return {
        items: pins.items.map((pin) => ({ message: upsertMessage(client, pin.message, guildId), pinnedAt: Date.parse(pin.pinned_at) })),
        hasMore: pins.has_more
    };
}

/**
 * Deletes up to 100 messages at once. Messages older than two weeks cannot be bulk deleted. A single id is deleted
 * on its own, since the bulk route needs at least two.
 */
export async function bulkDeleteMessages(client: ClientContext, channelId: string, messageIds: string[], reason?: string): Promise<void> {
    if (messageIds.length === 0) return;
    if (messageIds.length === 1) await client.rest.delete('channelMessage', channelId, messageIds[0], reason);
    else await client.rest.post('channelMessagesBulkDelete', channelId, { messages: messageIds }, reason);
}

export function toGuildBan(client: ClientContext, data: APIGuildBan): GuildBan {
    return { user: upsertUser(client, data.user), reason: data.reason };
}

export function toAuditLogChanges(data: APIAuditLogEntry['changes']): AuditLogChange[] {
    return (data ?? []).map((change) => ({ key: change.key ?? '', newValue: change.new_value, oldValue: change.old_value }));
}

export function toIntegrationApplication(client: ClientContext, data: APIIntegrationApplication): IntegrationApplication {
    return { id: data.id, name: data.name, icon: data.icon, description: data.description, bot: data.bot === undefined ? null : upsertUser(client, data.bot) };
}

/** A member's permissions across the guild, from the owner check, `@everyone` and their roles. */
export function computeGuildPermissions(guild: Guild, member: Member): bigint {
    if (member.id === guild.ownerId) return ALL_PERMISSIONS;
    let permissions = guild.roles.get(guild.id)?.permissions.allow ?? 0n;
    for (const roleId of member.roles) permissions |= guild.roles.get(roleId)?.permissions.allow ?? 0n;
    if ((permissions & Permissions.Administrator) !== 0n) return ALL_PERMISSIONS;
    return member.timedOut ? permissions & TIMED_OUT_PERMISSIONS : permissions;
}

/**
 * A member's permissions in a channel: the guild permissions with the `@everyone`, role and member overwrites
 * applied in that order. A member who cannot view the channel has no permissions in it.
 *
 * @throws When the channel's guild, or the member given by id, is not cached.
 */
export function computeChannelPermissions(channel: GuildChannel, member: Member | string): bigint {
    const guild = channel.guild;
    if (guild === undefined) throw new Error(`Guild ${channel.guildId} is not cached`);
    const resolved = typeof member === 'string' ? guild.members.get(member) : member;
    if (resolved === undefined) throw new Error(`Member ${member as string} of guild ${guild.id} is not cached`);

    let permissions = computeGuildPermissions(guild, resolved);
    if ((permissions & Permissions.Administrator) !== 0n) return ALL_PERMISSIONS;
    const overwrites = new Map(channel.permissionOverwrites.map((overwrite) => [overwrite.id, overwrite]));
    const everyone = overwrites.get(guild.id);
    if (everyone !== undefined) permissions = (permissions & ~everyone.deny) | everyone.allow;
    let allow = 0n;
    let deny = 0n;
    for (const roleId of resolved.roles) {
        const overwrite = overwrites.get(roleId);
        if (overwrite?.type !== OverwriteTypes.Role) continue;
        allow |= overwrite.allow;
        deny |= overwrite.deny;
    }
    permissions = (permissions & ~deny) | allow;
    const own = overwrites.get(resolved.id);
    if (own?.type === OverwriteTypes.Member) permissions = (permissions & ~own.deny) | own.allow;
    if (resolved.timedOut) permissions &= TIMED_OUT_PERMISSIONS;
    return (permissions & Permissions.ViewChannel) === 0n ? 0n : permissions;
}

export function toSubscription(data: APISubscription): Subscription {
    return {
        id: data.id,
        userId: data.user_id,
        skuIds: data.sku_ids,
        renewalSkuIds: data.renewal_sku_ids,
        entitlementIds: data.entitlement_ids,
        currentPeriodStart: Date.parse(data.current_period_start),
        currentPeriodEnd: Date.parse(data.current_period_end),
        status: data.status,
        canceledAt: parseTimestamp(data.canceled_at),
        country: data.country ?? null
    };
}

export function toVoiceChannelEffect(data: GatewayVoiceChannelEffectSendData): VoiceChannelEffect {
    return {
        channelId: data.channel_id,
        guildId: data.guild_id,
        userId: data.user_id,
        emoji: data.emoji == null ? null : toReactionEmoji(data.emoji),
        animationType: data.animation_type ?? null,
        animationId: data.animation_id ?? null,
        soundId: data.sound_id === undefined ? null : String(data.sound_id),
        soundVolume: data.sound_volume ?? null
    };
}

export function toGuildAuditLog(client: ClientContext, data: APIGuildAuditLog, guildId: string): GuildAuditLog {
    return {
        entries: data.audit_log_entries.map((entry) => new GuildAuditLogEntry(client, entry, guildId)),
        users: data.users.map((user) => upsertUser(client, user as APIUser)),
        integrations: data.integrations.map((integration) => new GuildIntegration(client, integration as APIIntegration, guildId)),
        webhooks: data.webhooks.map((webhook) => new Webhook(client, webhook as unknown as APIWebhook)),
        threads: data.threads.map((thread) => upsertThread(client, thread as unknown as APIChannel, guildId)),
        scheduledEvents: data.guild_scheduled_events.map((event) => upsertScheduledEvent(client, event as unknown as APIGuildScheduledEvent)),
        autoModerationRules: data.auto_moderation_rules.filter((rule) => rule !== null).map((rule) => upsertAutoModerationRule(client, rule as unknown as APIAutoModerationRule)),
        applicationCommands: data.application_commands.map((command) => new ApplicationCommand(client, command as unknown as APIApplicationCommand))
    };
}
