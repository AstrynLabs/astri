import type { APIErrorDetails, APIErrorResponse } from '../../types';
import { flattenErrors } from './util';

/** Discord rejected a request with a JSON error body. */
export class DiscordRESTError extends Error {
    override readonly name = 'DiscordRESTError';
    readonly status: number;
    /** Discord's JSON error code. */
    readonly code: number;
    readonly method: string;
    readonly route: string;
    /** Per-field validation errors, for `Invalid Form Body`. */
    readonly errors: APIErrorDetails | undefined;

    constructor(status: number, method: string, route: string, body: APIErrorResponse) {
        const fields = body.errors === undefined ? [] : flattenErrors(body.errors);
        super(`${method} ${route}: ${body.message} (${body.code})${fields.map((line) => `\n  ${line}`).join('')}`);
        this.status = status;
        this.code = body.code;
        this.method = method;
        this.route = route;
        this.errors = body.errors;
    }
}

/** A request failed with a status Discord gave no JSON error body for, such as a 5xx after retries. */
export class DiscordHTTPError extends Error {
    override readonly name = 'DiscordHTTPError';
    readonly status: number;
    readonly method: string;
    readonly route: string;
    readonly body: string;

    constructor(status: number, statusText: string, method: string, route: string, body: string) {
        super(`${method} ${route}: ${status} ${statusText}`);
        this.status = status;
        this.method = method;
        this.route = route;
        this.body = body;
    }
}
