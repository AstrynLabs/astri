import { ComponentTypes, MessageFlags } from '../../../constants';
import type { APIChannel, APIInteractionChannel, ClientContext, ComponentSelection, InteractionMessageData, RESTFile } from '../../../types';
import { createChannel, type Channel } from '../channels';
import type { InteractionResolved } from './resolved';

export function resolveSelection(type: ComponentTypes, values: string[], resolved: InteractionResolved): ComponentSelection {
    switch (type) {
        case ComponentTypes.UserSelect:
            return pick(values, resolved.users);
        case ComponentTypes.RoleSelect:
            return pick(values, resolved.roles);
        case ComponentTypes.ChannelSelect:
            return pick(values, resolved.channels);
        case ComponentTypes.MentionableSelect:
            return values.flatMap((id) => resolved.users.get(id) ?? resolved.roles.get(id) ?? []);
        default:
            return values;
    }
}

function pick<T>(values: string[], from: Map<string, T>): T[] {
    return values.flatMap((id) => from.get(id) ?? []);
}

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
