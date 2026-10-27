import { EventEmitter } from 'eventemitter3';
import { version } from '../../../package.json';
import { API_VERSION, BUCKET_SWEEP_INTERVAL, DEFAULT_API_URL, DEFAULT_GLOBAL_RATE_LIMIT, DEFAULT_REST_RETRIES, DEFAULT_REST_TIMEOUT, GLOBAL_RATE_LIMIT_WINDOW, RATE_LIMIT_MAJOR_PARAMS, RESTRoutes, ROUTE_PLACEHOLDER_PATTERN, TOKEN_ROUTE_PATTERN } from '../../constants';
import type { RESTArgs, RESTEvents, RESTMethod, RESTNamedRoute, RESTOptions, RESTRawRequestOptions, RESTRequestArgs, RESTResponse, RESTRoute, RESTRouteEntry, RESTRouteMethod, RESTRouteName, RESTRouteNameFor } from '../../types';
import { Bucket } from './bucket';
import { DiscordHTTPError, DiscordRESTError } from './errors';
import { buildQuery, parseError, readJSON, retryDelay, sleep, toBlob } from './util';

/**
 * Sends requests to Discord's REST API, typed from Discord's OpenAPI spec.
 *
 * The verb methods take a route name from {@link RESTRoutes}, then the route's path parameters in order, then
 * the body (or query string) if it takes one, then an audit log reason or options. {@link RequestHandler.request}
 * takes a raw route template instead. Requests are queued per rate limit bucket and against the global limit,
 * 429s are waited out and retried, and network errors, timeouts and 5xx responses are retried up to `retries`
 * times.
 *
 * @example
 * await rest.post('channelMessage', channelId, { content: 'Hello' }, 'Audit log reason');
 * await rest.get('channelMessages', channelId, { limit: 50 });
 * await rest.delete('channelMessage', channelId, messageId);
 */
export class RequestHandler extends EventEmitter<RESTEvents> {
    readonly #token: string;
    readonly #baseURL: string;
    readonly #timeout: number;
    readonly #retries: number;
    readonly #globalLimit: number;
    readonly #userAgent = `Astri-ts (https://github.com/FireGamer3/astri-ts, ${version})`;
    readonly #buckets = new Map<string, Bucket>();
    readonly #hashes = new Map<string, string>();
    #globalRemaining: number;
    #globalResetAt = 0;
    #globalBlockedUntil = 0;
    #lastSweep = Date.now();

    constructor(options: RESTOptions) {
        super();
        this.#token = options.token.replace(/^Bot\s+/i, '');
        this.#baseURL = `${(options.apiURL ?? DEFAULT_API_URL).replace(/\/+$/, '')}/v${options.version ?? API_VERSION}`;
        this.#timeout = options.timeout ?? DEFAULT_REST_TIMEOUT;
        this.#retries = options.retries ?? DEFAULT_REST_RETRIES;
        this.#globalLimit = options.globalLimit ?? DEFAULT_GLOBAL_RATE_LIMIT;
        this.#globalRemaining = this.#globalLimit;
    }

    /** Sends `method` to `route` and resolves with the parsed response body. */
    request<R extends RESTRoute, M extends RESTRouteMethod<R>>(method: M, route: R, ...[options]: RESTRequestArgs<R, M>): Promise<RESTResponse<R, M>> {
        return this.#queue(method, route, (options ?? {}) as RESTRawRequestOptions) as Promise<RESTResponse<R, M>>;
    }

    get<N extends RESTRouteNameFor<'get'>>(name: N, ...args: RESTArgs<N, 'get'>): Promise<RESTResponse<RESTNamedRoute<N, 'get'>, 'get'>> {
        return this.#call('get', name, args) as Promise<RESTResponse<RESTNamedRoute<N, 'get'>, 'get'>>;
    }

    post<N extends RESTRouteNameFor<'post'>>(name: N, ...args: RESTArgs<N, 'post'>): Promise<RESTResponse<RESTNamedRoute<N, 'post'>, 'post'>> {
        return this.#call('post', name, args) as Promise<RESTResponse<RESTNamedRoute<N, 'post'>, 'post'>>;
    }

    put<N extends RESTRouteNameFor<'put'>>(name: N, ...args: RESTArgs<N, 'put'>): Promise<RESTResponse<RESTNamedRoute<N, 'put'>, 'put'>> {
        return this.#call('put', name, args) as Promise<RESTResponse<RESTNamedRoute<N, 'put'>, 'put'>>;
    }

    patch<N extends RESTRouteNameFor<'patch'>>(name: N, ...args: RESTArgs<N, 'patch'>): Promise<RESTResponse<RESTNamedRoute<N, 'patch'>, 'patch'>> {
        return this.#call('patch', name, args) as Promise<RESTResponse<RESTNamedRoute<N, 'patch'>, 'patch'>>;
    }

    delete<N extends RESTRouteNameFor<'delete'>>(name: N, ...args: RESTArgs<N, 'delete'>): Promise<RESTResponse<RESTNamedRoute<N, 'delete'>, 'delete'>> {
        return this.#call('delete', name, args) as Promise<RESTResponse<RESTNamedRoute<N, 'delete'>, 'delete'>>;
    }

    async #call(method: RESTMethod, name: RESTRouteName, args: unknown[]): Promise<unknown> {
        const methods = RESTRoutes[name] as Partial<Record<RESTMethod, RESTRouteEntry>> | undefined;
        if (methods === undefined) throw new TypeError(`Unknown route "${name}"`);
        const entry = methods[method];
        if (entry === undefined) throw new TypeError(`Route "${name}" does not accept ${method.toUpperCase()}`);
        const params: Record<string, string> = {};
        let index = 0;
        for (const [, param] of entry.route.matchAll(ROUTE_PLACEHOLDER_PATTERN)) params[param] = args[index++] as string;
        let data: unknown;
        let extra = args[index];
        if (entry.data !== null && typeof extra !== 'string') {
            data = extra;
            extra = args[index + 1];
        }
        const options: RESTRawRequestOptions = typeof extra === 'string' ? { reason: extra } : { ...(extra as RESTRawRequestOptions | undefined) };
        options.params = params;
        if (entry.data === 'body') options.body = data;
        else if (entry.data === 'query' && data !== undefined) options.query = { ...options.query, ...(data as Record<string, unknown>) };
        return this.#queue(method, entry.route, options);
    }

    async #queue(method: RESTMethod, route: string, options: RESTRawRequestOptions): Promise<unknown> {
        const params = options.params ?? {};
        let major = '';
        const path = route.replace(ROUTE_PLACEHOLDER_PATTERN, (_, name: string) => {
            const value = params[name];
            if (value === undefined) throw new TypeError(`Missing path parameter "${name}" for ${route}`);
            if (RATE_LIMIT_MAJOR_PARAMS.has(name)) major += `:${value}`;
            return encodeURIComponent(String(value));
        });
        const routeKey = `${method.toUpperCase()} ${route}`;
        const bucketKey = `${this.#hashes.get(routeKey) ?? routeKey}${major}`;
        const bucket = this.#bucketFor(bucketKey);
        return bucket.run(() => this.#execute(method.toUpperCase(), route, routeKey, major, `${this.#baseURL}${path}${buildQuery(options.query)}`, bucket, options));
    }

    #bucketFor(key: string): Bucket {
        const now = Date.now();
        if (now - this.#lastSweep >= BUCKET_SWEEP_INTERVAL) {
            this.#lastSweep = now;
            for (const [bucketKey, bucket] of this.#buckets) if (bucket.idle) this.#buckets.delete(bucketKey);
        }
        let bucket = this.#buckets.get(key);
        if (bucket === undefined) {
            bucket = new Bucket();
            this.#buckets.set(key, bucket);
        }
        return bucket;
    }

    async #execute(method: string, route: string, routeKey: string, major: string, url: string, bucket: Bucket, options: RESTRawRequestOptions): Promise<unknown> {
        const auth = options.auth ?? !TOKEN_ROUTE_PATTERN.test(route);
        const headers: Record<string, string> = { 'User-Agent': this.#userAgent };
        if (auth) headers.Authorization = `Bot ${this.#token}`;
        if (options.reason !== undefined) headers['X-Audit-Log-Reason'] = encodeURIComponent(options.reason);
        let body: string | FormData | undefined;
        if (options.form === true) {
            body = new FormData();
            for (const [key, value] of Object.entries((options.body ?? {}) as Record<string, unknown>)) if (value !== undefined && value !== null) body.append(key, String(value));
            for (const file of options.files ?? []) body.append('file', toBlob(file), file.name);
        } else if (options.files !== undefined && options.files.length > 0) {
            body = new FormData();
            if (options.body !== undefined) body.append('payload_json', JSON.stringify(options.body));
            options.files.forEach((file, index) => (body as FormData).append(`files[${index}]`, toBlob(file), file.name));
        } else if (options.body !== undefined) {
            body = JSON.stringify(options.body);
            headers['Content-Type'] = 'application/json';
        }

        let failures = 0;
        for (;;) {
            if (auth) await this.#acquireGlobal();
            await bucket.acquire();

            let response: Response;
            try {
                const timeout = AbortSignal.timeout(this.#timeout);
                response = await fetch(url, { method, headers, body, signal: options.signal === undefined ? timeout : AbortSignal.any([options.signal, timeout]) });
            } catch (error) {
                if (options.signal?.aborted || failures >= this.#retries) throw error;
                failures++;
                this.emit('debug', `[REST] ${routeKey} failed (${(error as Error).message}), retry ${failures}/${this.#retries}`);
                await sleep(retryDelay(failures));
                continue;
            }

            bucket.update(response.headers);
            const hash = response.headers.get('x-ratelimit-bucket');
            if (hash !== null && this.#hashes.get(routeKey) !== hash) {
                this.#hashes.set(routeKey, hash);
                if (!this.#buckets.has(`${hash}${major}`)) this.#buckets.set(`${hash}${major}`, bucket);
            }

            if (response.status === 429) {
                const data = (await readJSON(response)) as { retry_after?: number; global?: boolean } | undefined;
                const retryAfter = (data?.retry_after ?? Number(response.headers.get('retry-after') ?? 1)) * 1000;
                const global = data?.global ?? response.headers.get('x-ratelimit-global') !== null;
                if (global) this.#globalBlockedUntil = Date.now() + retryAfter;
                else bucket.block(retryAfter);
                this.emit('rateLimit', { method, route, bucket: hash, global, scope: response.headers.get('x-ratelimit-scope'), retryAfter });
                this.emit('debug', `[REST] ${routeKey} hit a ${global ? 'global' : 'bucket'} rate limit, retrying in ${retryAfter}ms`);
                continue;
            }

            if (response.status >= 500 && failures < this.#retries) {
                await response.body?.cancel();
                failures++;
                this.emit('debug', `[REST] ${routeKey} returned ${response.status}, retry ${failures}/${this.#retries}`);
                await sleep(retryDelay(failures));
                continue;
            }

            if (response.ok) return readJSON(response);
            const text = await response.text();
            const error = parseError(text);
            if (error !== undefined) throw new DiscordRESTError(response.status, method, route, error);
            throw new DiscordHTTPError(response.status, response.statusText, method, route, text);
        }
    }

    async #acquireGlobal(): Promise<void> {
        for (;;) {
            const now = Date.now();
            if (now < this.#globalBlockedUntil) {
                await sleep(this.#globalBlockedUntil - now);
                continue;
            }
            if (now >= this.#globalResetAt) {
                this.#globalResetAt = now + GLOBAL_RATE_LIMIT_WINDOW;
                this.#globalRemaining = this.#globalLimit;
            }
            if (this.#globalRemaining > 0) {
                this.#globalRemaining--;
                return;
            }
            await sleep(this.#globalResetAt - now);
        }
    }
}
