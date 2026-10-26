import type { RESTRoutes } from '../constants';
import type { APIComponents, APIPaths } from './discord';

export type RESTMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/** Every route template in Discord's OpenAPI spec, such as `/channels/{channel_id}/messages`. */
export type RESTRoute = keyof APIPaths;

/** Methods `R` accepts. */
export type RESTRouteMethod<R extends RESTRoute> = { [M in RESTMethod]: APIPaths[R][M] extends undefined ? never : M }[RESTMethod];

/** Routes that accept method `M`. */
export type RESTRouteFor<M extends RESTMethod> = { [R in RESTRoute]: M extends RESTRouteMethod<R> ? R : never }[RESTRoute];

type RESTOperation<R extends RESTRoute, M extends RESTMethod> = NonNullable<APIPaths[R][M]>;
type OperationParameters<Op> = Op extends { parameters: infer P } ? P : undefined;
type ContentBody<C> = C extends { 'application/json': infer B } ? B : C[keyof C];
type RequestBody<RB> = RB extends { content: infer C } ? ContentBody<C> : RB;
type SuccessStatus = 200 | 201 | 202 | 204;
type ResponseBody<Res> = { [S in keyof Res & SuccessStatus]: Res[S] extends { content: { 'application/json': infer T } } ? T : undefined }[keyof Res & SuccessStatus];

/** Values for the `{placeholders}` of `R`. */
export type RESTPathParams<R extends RESTRoute, M extends RESTMethod> = OperationParameters<RESTOperation<R, M>> extends { path?: unknown } ? OperationParameters<RESTOperation<R, M>>['path'] : undefined;

/** Query string parameters `M` on `R` accepts. */
export type RESTQuery<R extends RESTRoute, M extends RESTMethod> = OperationParameters<RESTOperation<R, M>> extends { query?: unknown } ? OperationParameters<RESTOperation<R, M>>['query'] : undefined;

/** JSON body `M` on `R` accepts. */
export type RESTBody<R extends RESTRoute, M extends RESTMethod> = RESTOperation<R, M> extends { requestBody?: unknown } ? RequestBody<RESTOperation<R, M>['requestBody']> : undefined;

/** Parsed body of a successful response, `undefined` for `204 No Content`. */
export type RESTResponse<R extends RESTRoute, M extends RESTMethod> = RESTOperation<R, M> extends { responses: infer Res } ? ResponseBody<Res> : never;

type Field<K extends string, T> = [T] extends [undefined] ? { [P in K]?: undefined } : undefined extends T ? { [P in K]?: T } : { [P in K]: T };

/** A file to upload. It is sent as `files[n]`, with the request body moved into `payload_json`. */
export interface RESTFile {
    name: string;
    data: Blob | ArrayBuffer | Uint8Array | string;
    contentType?: string;
}

export interface RESTRequestBaseOptions {
    files?: RESTFile[];
    /** Shown in the guild's audit log. */
    reason?: string;
    /** Whether to send the bot token. Default: `false` on webhook and interaction token routes, `true` otherwise. */
    auth?: boolean;
    signal?: AbortSignal;
}

/** Options for one request. `params` and `body` are required when the route needs them. */
export type RESTRequestOptions<R extends RESTRoute, M extends RESTMethod> = Field<'params', RESTPathParams<R, M>> & Field<'query', RESTQuery<R, M>> & Field<'body', RESTBody<R, M>> & RESTRequestBaseOptions;

/** The options argument of a request, optional when nothing in it is required. */
export type RESTRequestArgs<R extends RESTRoute, M extends RESTMethod> = {} extends RESTRequestOptions<R, M> ? [options?: RESTRequestOptions<R, M>] : [options: RESTRequestOptions<R, M>];

/** Name of a route in {@link RESTRoutes}, such as `channelMessage`. */
export type RESTRouteName = keyof typeof RESTRoutes;

/** Route names that accept method `M`. */
export type RESTRouteNameFor<M extends RESTMethod> = { [N in RESTRouteName]: M extends keyof (typeof RESTRoutes)[N] ? N : never }[RESTRouteName];

/** The route template `M` on route name `N` is sent to. */
export type RESTNamedRoute<N extends RESTRouteName, M extends RESTMethod> = (typeof RESTRoutes)[N] extends { readonly [K in M]: { readonly route: infer R extends RESTRoute } } ? R : never;

type PathParamNames<R extends string> = R extends `${string}{${infer P}}${infer Rest}` ? [P, ...PathParamNames<Rest>] : [];
type PathParamArgs<Names extends string[]> = { [K in keyof Names]: string };
type DataArg<T> = undefined extends T ? [data?: Exclude<T, undefined>] : [data: T];
type DataArgs<R extends RESTRoute, M extends RESTMethod> = [RESTBody<R, M>] extends [undefined] ? ([RESTQuery<R, M>] extends [undefined] ? [] : DataArg<RESTQuery<R, M>>) : DataArg<RESTBody<R, M>>;

/** Options after the positional arguments. `query` is for routes that take both a body and a query string. */
export type RESTCallOptions<R extends RESTRoute, M extends RESTMethod> = RESTRequestBaseOptions & Field<'query', Exclude<RESTQuery<R, M>, undefined> | undefined>;

/**
 * Arguments after the route name: each path parameter in the order the route lists them, then the body (or the
 * query string, for routes without a body) if the route takes one, then an audit log reason or options.
 */
export type RESTArgs<N extends RESTRouteName, M extends RESTMethod> = [...PathParamArgs<PathParamNames<RESTNamedRoute<N, M>>>, ...DataArgs<RESTNamedRoute<N, M>, M>, options?: string | RESTCallOptions<RESTNamedRoute<N, M>, M>];

export interface RESTOptions {
    token: string;
    /** Default: `DEFAULT_API_URL`. */
    apiURL?: string;
    /** Default: `API_VERSION`. */
    version?: number;
    /** Milliseconds before an attempt is aborted and retried. Default: `15000`. */
    timeout?: number;
    /** Retries after a network error, timeout or 5xx response. 429s are always retried. Default: `3`. */
    retries?: number;
    /** Authenticated requests allowed per second across all routes. Default: `50`. */
    globalLimit?: number;
}

export interface RESTRateLimitInfo {
    method: string;
    route: string;
    /** Discord's hash for the route's bucket, if it sent one. */
    bucket: string | null;
    global: boolean;
    /** `user` and `global` limits count against the bot; `shared` limits are on the resource and do not. */
    scope: string | null;
    /** Milliseconds until the request is retried. */
    retryAfter: number;
}

export interface RESTEvents {
    /** A request hit a 429 and is queued to retry. */
    rateLimit: [info: RESTRateLimitInfo];
    debug: [message: string];
}

export type APIErrorResponse = APIComponents['schemas']['ErrorResponse'];
export type APIErrorDetails = APIComponents['schemas']['ErrorDetails'];

/** What `M` on a route name in `RESTRoutes` is sent to, and what the argument after its path parameters is. */
export interface RESTRouteEntry {
    route: string;
    data: 'body' | 'query' | null;
}

/** Request options with path parameters, query and body untyped, as the handler sends them. */
export interface RESTRawRequestOptions extends RESTRequestBaseOptions {
    params?: Record<string, string | number>;
    query?: Record<string, unknown>;
    body?: unknown;
}
