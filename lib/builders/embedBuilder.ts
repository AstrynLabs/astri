import { BuilderLimits } from '../constants';
import { Embed } from '../core/structures';
import type { APIRichEmbed, APIRichEmbedField, ColorResolvable, EmbedAuthorData } from '../types';
import { checkLength, toColor } from './util';

/**
 * Builds an embed to pass in a message's `embeds`. Every part is optional, but Discord rejects an embed with nothing in
 * it. Text over Discord's limits throws when it is set.
 */
export class EmbedBuilder {
    #data: APIRichEmbed = {};

    constructor(title?: string, description?: string) {
        if (title !== undefined) this.setTitle(title);
        if (description !== undefined) this.setDescription(description);
    }

    /** A builder starting from an existing embed, for editing it and sending it again. */
    static from(embed: Embed | APIRichEmbed): EmbedBuilder {
        const builder = new EmbedBuilder();
        builder.#data = embed instanceof Embed ? embed.toJSON() : structuredClone(embed);
        return builder;
    }

    /** The characters that count toward Discord's limit of 6000 per message, across every embed. */
    get length(): number {
        const { title, description, fields, footer, author } = this.#data;
        return (title?.length ?? 0) + (description?.length ?? 0) + (fields?.reduce((total, field) => total + field.name.length + field.value.length, 0) ?? 0) + (footer?.text?.length ?? 0) + (author?.name?.length ?? 0);
    }

    setTitle(title: string): this {
        checkLength(title, BuilderLimits.EmbedTitleLength, 'An embed title');
        this.#data.title = title;
        return this;
    }

    setDescription(description: string): this {
        checkLength(description, BuilderLimits.EmbedDescriptionLength, 'An embed description');
        this.#data.description = description;
        return this;
    }

    /** Makes the title a link. */
    setURL(url: string): this {
        this.#data.url = url;
        return this;
    }

    /** The bar along the embed's left edge. */
    setColor(color: ColorResolvable): this {
        this.#data.color = toColor(color);
        return this;
    }

    /** Shown in the footer, in each viewer's timezone. Default: now. */
    setTimestamp(timestamp: Date | number = new Date()): this {
        this.#data.timestamp = new Date(timestamp).toISOString();
        return this;
    }

    setAuthor(data: EmbedAuthorData): this {
        checkLength(data.name, BuilderLimits.EmbedAuthorNameLength, 'An embed author name');
        this.#data.author = data;
        return this;
    }

    setFooter(text: string, iconURL?: string): this {
        checkLength(text, BuilderLimits.EmbedFooterTextLength, 'An embed footer');
        this.#data.footer = { text, icon_url: iconURL };
        return this;
    }

    /** The large image below the description. Use `attachment://<name>` to show a file uploaded with the message. */
    setImage(url: string, description?: string): this {
        this.#data.image = { url, description };
        return this;
    }

    /** The small image in the top right. Use `attachment://<name>` to show a file uploaded with the message. */
    setThumbnail(url: string, description?: string): this {
        this.#data.thumbnail = { url, description };
        return this;
    }

    /** Inline fields sit side by side, up to three to a row. At most 25 fields can be added. */
    addField(name: string, value: string, inline = false): this {
        return this.addFields({ name, value, inline });
    }

    addFields(...fields: APIRichEmbedField[]): this {
        const existing = this.#data.fields ?? [];
        if (existing.length + fields.length > BuilderLimits.EmbedFields) throw new TypeError(`An embed can't have more than ${BuilderLimits.EmbedFields} fields`);
        for (const field of fields) {
            checkLength(field.name, BuilderLimits.EmbedFieldNameLength, 'An embed field name');
            checkLength(field.value, BuilderLimits.EmbedFieldValueLength, 'An embed field value');
        }
        this.#data.fields = [...existing, ...fields];
        return this;
    }

    /** Throws when the embed's text is over 6000 characters. */
    toJSON(): APIRichEmbed {
        if (this.length > BuilderLimits.EmbedTotalLength) throw new TypeError(`An embed can't have more than ${BuilderLimits.EmbedTotalLength} characters of text`);
        return structuredClone(this.#data);
    }
}
