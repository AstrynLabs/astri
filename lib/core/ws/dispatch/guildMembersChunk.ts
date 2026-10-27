import type { GuildMembersChunk } from '../../../interfaces';
import type { DispatchHandler } from '../../../types';
import { upsertMember, upsertPresence } from '../../structures';

export const guildMembersChunk: DispatchHandler<'GUILD_MEMBERS_CHUNK'> = (client, data) => {
    const chunk: GuildMembersChunk = {
        guildId: data.guild_id,
        members: data.members.map((member) => upsertMember(client, member, data.guild_id)),
        presences: data.presences?.map((presence) => upsertPresence(client, presence, data.guild_id)) ?? [],
        notFound: data.not_found ?? [],
        chunkIndex: data.chunk_index,
        chunkCount: data.chunk_count,
        nonce: data.nonce ?? null
    };
    client.emit('guildMembersChunk', chunk);
    client.settleMemberRequest(chunk);
};
