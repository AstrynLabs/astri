import type Client from '../Client';
import Base from './Base';
import type User from './User';

export default class PartialUser extends Base {
  _client?: Client;
  _missingClientError?: Error;
  constructor(data: { id: string }, client?: Client) {
    super(data.id);
    if (!client) {
      this._missingClientError = new Error('Missing client in constructor'); // Preserve constructor callstack
    }
    this._client = client;
  }

  isPartial(): this is PartialUser {
    return !('bot' in this);
  }

  isCached(): this is User {
    return 'bot' in this;
  }
}
