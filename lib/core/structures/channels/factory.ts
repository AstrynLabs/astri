import { ChannelTypes } from '../../../constants';
import type { APIChannel, ClientContext } from '../../../types';
import type { Channel } from './channel';
import { UnknownChannel } from './channel';
import { CategoryChannel, DirectoryChannel } from './guildChannel';
import { DMChannel, GroupDMChannel } from './privateChannel';
import { AnnouncementChannel, TextChannel } from './textChannel';
import { AnnouncementThreadChannel, PrivateThreadChannel, PublicThreadChannel, type ThreadChannel } from './threadChannel';
import { ForumChannel, MediaChannel } from './threadOnlyChannel';
import { StageChannel, VoiceChannel } from './voiceChannel';

/**
 * A new channel of the class matching `data.type`. Types without a class, and guild types arriving without a
 * guild id, become an {@link UnknownChannel}.
 *
 * `guildId` defaults to `data.guild_id`; pass it for payloads that leave it out, like the channels in `GUILD_CREATE`.
 */
export function createChannel(client: ClientContext, data: APIChannel, guildId: string | null = data.guild_id ?? null): Channel {
    switch (data.type) {
        case ChannelTypes.DM:
            return new DMChannel(client, data);
        case ChannelTypes.GroupDM:
            return new GroupDMChannel(client, data);
    }
    if (guildId === null) return new UnknownChannel(client, data, null);

    switch (data.type) {
        case ChannelTypes.GuildText:
            return new TextChannel(client, data, guildId);
        case ChannelTypes.GuildVoice:
            return new VoiceChannel(client, data, guildId);
        case ChannelTypes.GuildCategory:
            return new CategoryChannel(client, data, guildId);
        case ChannelTypes.GuildAnnouncement:
            return new AnnouncementChannel(client, data, guildId);
        case ChannelTypes.AnnouncementThread:
        case ChannelTypes.PublicThread:
        case ChannelTypes.PrivateThread:
            return createThreadChannel(client, data, guildId);
        case ChannelTypes.GuildStageVoice:
            return new StageChannel(client, data, guildId);
        case ChannelTypes.GuildDirectory:
            return new DirectoryChannel(client, data, guildId);
        case ChannelTypes.GuildForum:
            return new ForumChannel(client, data, guildId);
        case ChannelTypes.GuildMedia:
            return new MediaChannel(client, data, guildId);
        default:
            return new UnknownChannel(client, data, guildId);
    }
}

/** A new thread of the class matching `data.type`. Anything that is not an announcement or private thread is built as a public one. */
export function createThreadChannel(client: ClientContext, data: APIChannel, guildId: string): ThreadChannel {
    switch (data.type) {
        case ChannelTypes.AnnouncementThread:
            return new AnnouncementThreadChannel(client, data, guildId);
        case ChannelTypes.PrivateThread:
            return new PrivateThreadChannel(client, data, guildId);
        default:
            return new PublicThreadChannel(client, data, guildId);
    }
}

/** The cached thread for `data.id` patched with `data`, or a new one, cached if its guild is. A cached thread of another type is replaced. */
export function upsertThread(client: ClientContext, data: APIChannel, guildId: string): ThreadChannel {
    const threads = client.guilds.get(guildId)?.threads;
    const cached = threads?.get(data.id);
    if (cached !== undefined && cached.type === data.type) {
        cached.patch(data);
        return cached;
    }
    const created = createThreadChannel(client, data, guildId);
    threads?.set(created.id, created);
    return created;
}
