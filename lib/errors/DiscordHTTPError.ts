'use strict';

import type { ClientRequest, IncomingMessage } from 'http';

export default class DiscordHTTPError extends Error {
  req: ClientRequest;
  res: IncomingMessage;
  response: any;
  stack: any;
  code: number;
  message: string;
  constructor(req: ClientRequest, res: IncomingMessage, response: any, stack: any) {
    super();

    this.req = req;
    this.res = res;
    this.response = response;
    this.code = res.statusCode ?? 0;

    let message = `${res.statusCode} ${res.statusMessage} on ${req.method} ${req.path}`;
    const errors = this.flattenErrors(response as Error[]);
    if (errors.length > 0) {
      message += '\n  ' + errors.join('\n  ');
    }

    this.message = message;

    if (stack) {
      this.stack = this.name + ': ' + this.message + '\n' + stack;
    } else {
      Error.captureStackTrace(this, DiscordHTTPError);
    }
  }

  get headers(): Headers {
    return this.response.headers;
  }

  get name(): string {
    return this.constructor.name;
  }

  flattenErrors(errors: Error[], keyPrefix = ''): string[] {
    let messages: string[] = [];
    for (const fieldName in errors) {
      if (!Object.prototype.hasOwnProperty.call(errors, fieldName) || fieldName === 'message' || fieldName === 'code') {
        continue;
      }
      if (Array.isArray(errors[fieldName])) {
        messages = messages.concat((errors[fieldName] as unknown as string[]).map((str: any) => `${keyPrefix + fieldName}: ${str}`)); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      }
    }
    return messages;
  }
}
