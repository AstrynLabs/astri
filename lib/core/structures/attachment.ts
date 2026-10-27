import type { APIAttachment, ClientContext } from '../../types';
import { Base } from './base';

/** A file attached to a message, or passed to a command's attachment option. Attachments never change once sent. */
export class Attachment extends Base {
    readonly filename: string;
    /** Bytes. */
    readonly size: number;
    readonly url: string;
    /** Discord's cached copy of `url`. */
    readonly proxyURL: string;
    readonly contentType: string | null;
    /** Alt text. */
    readonly description: string | null;
    /** The name shown instead of `filename`, if one was given. */
    readonly title: string | null;
    /** Images and videos only. */
    readonly width: number | null;
    /** Images and videos only. */
    readonly height: number | null;
    /** Voice messages only. */
    readonly durationSecs: number | null;
    /** Voice messages only: base64 encoded bytearray of the sampled waveform. */
    readonly waveform: string | null;
    /** Command options only: deleted once the interaction ends. */
    readonly ephemeral: boolean;
    readonly flags: number;

    constructor(client: ClientContext, data: APIAttachment) {
        super(client, data.id);
        this.filename = data.filename;
        this.size = data.size;
        this.url = data.url;
        this.proxyURL = data.proxy_url;
        this.contentType = data.content_type ?? null;
        this.description = data.description ?? null;
        this.title = data.title ?? null;
        this.width = data.width ?? null;
        this.height = data.height ?? null;
        this.durationSecs = data.duration_secs ?? null;
        this.waveform = data.waveform ?? null;
        this.ephemeral = data.ephemeral ?? false;
        this.flags = data.flags ?? 0;
    }

    /** Whether the file is hidden behind a spoiler. */
    get spoiler(): boolean {
        return this.filename.startsWith('SPOILER_');
    }
}
