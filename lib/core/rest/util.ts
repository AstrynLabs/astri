import { MAX_RETRY_DELAY, RETRY_BASE_DELAY } from '../../constants';
import type { APIErrorDetails, APIErrorResponse, RESTFile } from '../../types';

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildQuery(query: Record<string, unknown> | undefined): string {
    if (query === undefined) return '';
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) for (const item of value) search.append(key, String(item));
        else search.append(key, String(value));
    }
    const string = search.toString();
    return string === '' ? '' : `?${string}`;
}

export function toBlob(file: RESTFile): Blob {
    return file.data instanceof Blob ? file.data : new Blob([file.data as BlobPart], file.contentType === undefined ? undefined : { type: file.contentType });
}

export function retryDelay(failures: number): number {
    return Math.min(RETRY_BASE_DELAY * 2 ** (failures - 1), MAX_RETRY_DELAY);
}

export async function readJSON(response: Response): Promise<unknown> {
    if (!response.headers.get('content-type')?.includes('application/json')) {
        await response.body?.cancel();
        return undefined;
    }
    const text = await response.text();
    return text === '' ? undefined : JSON.parse(text);
}

export function parseError(text: string): APIErrorResponse | undefined {
    try {
        const data = JSON.parse(text) as Partial<APIErrorResponse>;
        return typeof data.code === 'number' && typeof data.message === 'string' ? (data as APIErrorResponse) : undefined;
    } catch {
        return undefined;
    }
}

export function flattenErrors(details: APIErrorDetails, path = ''): string[] {
    if ('_errors' in details && Array.isArray(details._errors)) return details._errors.map((error) => `${path || '(root)'}: ${error.message} (${error.code})`);
    const lines: string[] = [];
    for (const [key, value] of Object.entries(details as Record<string, APIErrorDetails>)) {
        const next = path === '' ? key : /^\d+$/.test(key) ? `${path}[${key}]` : `${path}.${key}`;
        lines.push(...flattenErrors(value, next));
    }
    return lines;
}
