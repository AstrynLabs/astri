export interface Attachment {
    id: string;
    filename: string;
    /** Bytes. */
    size: number;
    url: string;
    proxyURL: string;
    contentType: string | null;
    description: string | null;
    /** Images and videos only. */
    width: number | null;
    /** Images and videos only. */
    height: number | null;
    /** Voice messages only. */
    durationSecs: number | null;
    /** Voice messages only: base64 encoded bytearray of the sampled waveform. */
    waveform: string | null;
    ephemeral: boolean;
    flags: number;
}
