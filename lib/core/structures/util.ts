export function parseTimestamp(value: string | null): number | null {
    return value === null ? null : Date.parse(value);
}
