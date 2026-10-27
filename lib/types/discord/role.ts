export interface APIRole {
    id: string;
    name: string;
    color: number;
    hoist: boolean;
    icon?: string | null;
    unicode_emoji?: string | null;
    position: number;
    /** Permission bitfield, serialized as a decimal string. */
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    flags: number;
}
