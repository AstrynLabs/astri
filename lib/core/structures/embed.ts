import type { EmbedAuthor, EmbedField, EmbedFooter, EmbedMedia, EmbedProvider } from '../../interfaces';
import type { APIEmbed, APIRichEmbed } from '../../types';
import { parseTimestamp, toEmbedMedia } from './util';

/** An embed on a message: one set by its author, or a preview Discord generated from a link. */
export class Embed {
    /** `rich` for embeds set by the author. Link previews have `image`, `video`, `gifv`, `article` or `link`. */
    readonly type: string;
    readonly title: string | null;
    readonly description: string | null;
    readonly url: string | null;
    readonly color: number | null;
    /** Unix ms shown in the footer, or `null`. */
    readonly timestamp: number | null;
    readonly fields: EmbedField[];
    readonly author: EmbedAuthor | null;
    readonly footer: EmbedFooter | null;
    readonly image: EmbedMedia | null;
    readonly thumbnail: EmbedMedia | null;
    /** Link previews only. */
    readonly video: EmbedMedia | null;
    /** Link previews only. */
    readonly audio: EmbedMedia | null;
    /** Link previews only. */
    readonly provider: EmbedProvider | null;
    readonly flags: number;

    constructor(data: APIEmbed) {
        this.type = data.type;
        this.title = data.title ?? null;
        this.description = data.description ?? null;
        this.url = data.url ?? null;
        this.color = data.color ?? null;
        this.timestamp = parseTimestamp(data.timestamp ?? null);
        this.fields = data.fields?.map((field) => ({ name: field.name, value: field.value, inline: field.inline })) ?? [];
        this.author = data.author === undefined ? null : { name: data.author.name, url: data.author.url ?? null, iconURL: data.author.icon_url ?? null, proxyIconURL: data.author.proxy_icon_url ?? null };
        this.footer = data.footer === undefined ? null : { text: data.footer.text, iconURL: data.footer.icon_url ?? null, proxyIconURL: data.footer.proxy_icon_url ?? null };
        this.image = data.image === undefined ? null : toEmbedMedia(data.image);
        this.thumbnail = data.thumbnail === undefined ? null : toEmbedMedia(data.thumbnail);
        this.video = data.video === undefined ? null : toEmbedMedia(data.video);
        this.audio = data.audio === undefined ? null : toEmbedMedia(data.audio);
        this.provider = data.provider === undefined ? null : { name: data.provider.name, url: data.provider.url ?? null };
        this.flags = data.flags ?? 0;
    }

    /** The embed as a request body, for sending it again. Link preview only parts (`video`, `audio`, `provider`) are left out. */
    toJSON(): APIRichEmbed {
        return {
            title: this.title,
            description: this.description,
            url: this.url,
            color: this.color,
            timestamp: this.timestamp === null ? null : new Date(this.timestamp).toISOString(),
            fields: this.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline })),
            author: this.author === null ? null : { name: this.author.name, url: this.author.url, icon_url: this.author.iconURL },
            footer: this.footer === null ? null : { text: this.footer.text, icon_url: this.footer.iconURL },
            image: this.image?.url == null ? null : { url: this.image.url, description: this.image.description },
            thumbnail: this.thumbnail?.url == null ? null : { url: this.thumbnail.url, description: this.thumbnail.description }
        };
    }
}
