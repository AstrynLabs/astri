'use strict';

import util from 'util';

export default class Base<Key = string> {
  /**
   * A Discord snowflake identifying the object
   *
   * @type {Key}
   * @memberof Base
   */
  id: Key;

  constructor(id?: Key) {
    if (id) this.id = id;
  }

  update(...args: any): void {}

  /**
   * Timestamp of structure creation
   *
   * @readonly
   * @memberof Base
   */
  get createdAt(): number {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Base.getCreatedAt(`${this.id || 0}`);
  }

  /**
   * Calculates the timestamp in milliseconds associated with a Discord ID/snowflake
   *
   * @static
   * @param {string} id The ID of a structure
   * @return {number}
   * @memberof Base
   */
  static getCreatedAt(id: string): number {
    return Base.getDiscordEpoch(id) + 1420070400000;
  }

  /**
   * Gets the number of milliseconds since epoch represented by an ID/snowflake
   *
   * @static
   * @param {string} id The ID of a structure
   * @return {number}
   * @memberof Base
   */
  static getDiscordEpoch(id: string): number {
    return Math.floor(Number(id) / 4194304);
  }

  /* eslint-disable */
  [util.inspect.custom]() {
    // http://stackoverflow.com/questions/5905492/dynamic-function-name-in-javascript
    const copy = new { [this.constructor.name]: class {} }[this.constructor.name]();
    for (const key in this) {
      if (this.hasOwnProperty(key) && !key.startsWith('_') && this[key] !== undefined) {
        // @ts-ignore
        copy[key] = this[key];
      }
    }
    return copy;
  }
  /* eslint-enable */

  toString(): string {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return `[${this.constructor.name} ${this.id}]`;
  }

  toJSON(props: string[] = []): Record<string, any> {
    const json: Record<string, any> = {};
    if (this.id) {
      json.id = this.id;
      json.createdAt = this.createdAt;
    }
    for (const prop of props) {
      // @ts-expect-error -- toJSON will be called from child to index props not on Base
      const value: Record<string, any> = this[prop];
      const type = typeof value;
      if (value === undefined) {
        continue;
      } else if ((type !== 'object' && type !== 'function' && type !== 'bigint') || value === null) {
        json[prop] = value;
      } else if (value.toJSON !== undefined) {
        json[prop] = value.toJSON();
      } else if (value.values !== undefined) {
        json[prop] = [...value.values()];
      } else if (type === 'bigint') {
        json[prop] = value.toString(); // eslint-disable-line -- https://typescript-eslint.io/rules/no-base-to-string/
      } else if (type === 'object') {
        json[prop] = value;
      }
    }
    return json;
  }
}
