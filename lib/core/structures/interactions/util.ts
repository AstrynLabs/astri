import { MessageFlags } from '../../../constants';
import type { Attachment } from '../../../interfaces';
import type { APIAttachment, APIChannel, APIInteractionChannel, ClientContext, InteractionEditData, InteractionMessageData, InteractionUpdateData, RESTFile } from '../../../types';
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

export function toAttachment(data: APIAttachment): Attachment {
    return {
        id: data.id,
        filename: data.filename,
        size: data.size,
        url: data.url,
        proxyURL: data.proxy_url,
        contentType: data.content_type ?? null,
        description: data.description ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        durationSecs: data.duration_secs ?? null,
        waveform: data.waveform ?? null,
        ephemeral: data.ephemeral ?? false,
        flags: data.flags ?? 0
    };
}

export function messageBody(data: string | InteractionMessageData): [body: Omit<InteractionMessageData, 'files' | 'ephemeral'>, files: RESTFile[] | undefined] {
    if (typeof data === 'string') return [{ content: data }, undefined];
    const { files, ephemeral, ...body }: InteractionMessageData = data;
    if (ephemeral === true) body.flags = (body.flags ?? 0) | MessageFlags.Ephemeral;
    return [body, files];
}

export function editBody<T extends InteractionEditData | InteractionUpdateData>(data: string | T): [body: Omit<T, 'files'>, files: RESTFile[] | undefined] {
    if (typeof data === 'string') return [{ content: data } as unknown as Omit<T, 'files'>, undefined];
    const { files, ...body } = data;
    return [body, files];
}
