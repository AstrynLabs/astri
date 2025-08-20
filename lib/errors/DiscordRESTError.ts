'use strict';

import type { ClientRequest, IncomingMessage } from 'http';

export default class DiscordRESTError extends Error {
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
    this.code = +response.code || -1;

    let message = response.message || 'Unknown error';
    if (response.errors) {
      message += '\n  ' + this.flattenErrors(response.errors).join('\n  '); // eslint-disable-line @typescript-eslint/no-unsafe-argument
    } else {
      const errors = this.flattenErrors(response); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      if (errors.length > 0) {
        message += '\n  ' + errors.join('\n  ');
      }
    }
    this.message = message;

    if (stack) {
      this.stack = this.name + ': ' + this.message + '\n' + stack;
    } else {
      Error.captureStackTrace(this, DiscordRESTError);
    }
  }

  get headers(): Headers {
    return this.response.headers;
  }

  get name(): string {
    return `${this.constructor.name} [${this.code}]`;
  }

  flattenErrors(errors: any[], keyPrefix = ''): string[] {
    let messages: string[] = [];
    for (const fieldName in errors) {
      if (!Object.prototype.hasOwnProperty.call(errors, fieldName) || fieldName === 'message' || fieldName === 'code') {
        continue;
      }
      if (errors[fieldName]._errors) {
        messages = messages.concat(errors[fieldName]._errors.map((obj: any) => `${keyPrefix + fieldName}: ${obj.message}`)); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      } else if (Array.isArray(errors[fieldName])) {
        messages = messages.concat(errors[fieldName].map((str: string) => `${keyPrefix + fieldName}: ${str}`)); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      } else if (typeof errors[fieldName] === 'object') {
        messages = messages.concat(this.flattenErrors(errors[fieldName], keyPrefix + fieldName + '.')); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      }
    }
    return messages;
  }
}
