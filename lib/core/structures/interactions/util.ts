import { MessageFlags } from '../../../constants';
import type { APIChannel, APIInteractionChannel, ClientContext, InteractionMessageData, RESTFile } from '../../../types';
import { createChannel, type Channel } from '../channels';

export function resolveChannel(client: ClientContext, data: APIInteractionChannel, guildId: string | null): Channel {
    const guild = guildId === null ? undefined : client.guilds.get(guildId);
    const cached = guild?.channels.get(data.id) ?? guild?.threads.get(data.id);
    if (cached !== undefined && cached.type === data.type) {
        cached.patch(data);
        return cached;
    }
    return createChannel(client, data as APIChannel, guildId);
}

export function messageBody(data: string | InteractionMessageData): [body: Omit<InteractionMessageData, 'files' | 'ephemeral'>, files: RESTFile[] | undefined] {
    if (typeof data === 'string') return [{ content: data }, undefined];
    const { files, ephemeral, ...body }: InteractionMessageData = data;
    if (ephemeral === true) body.flags = (body.flags ?? 0) | MessageFlags.Ephemeral;
    return [body, files];
}
