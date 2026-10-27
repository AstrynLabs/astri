export interface EmbedField {
    name: string;
    value: string;
    /** Whether it may sit next to other inline fields. */
    inline: boolean;
}

export interface EmbedAuthor {
    name: string;
    url: string | null;
    iconURL: string | null;
    /** Discord's cached copy of `iconURL`. */
    proxyIconURL: string | null;
}

export interface EmbedFooter {
    text: string;
    iconURL: string | null;
    /** Discord's cached copy of `iconURL`. */
    proxyIconURL: string | null;
}

/** An embed's image, thumbnail, video or audio. */
export interface EmbedMedia {
    url: string | null;
    /** Discord's cached copy of `url`. */
    proxyURL: string | null;
    /** Images and videos only. */
    width: number | null;
    /** Images and videos only. */
    height: number | null;
    contentType: string | null;
    /** Alt text. */
    description: string | null;
    flags: number;
}

/** The site a link embed came from. */
export interface EmbedProvider {
    name: string;
    url: string | null;
}
