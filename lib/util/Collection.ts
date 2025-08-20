'use strict';

import type Base from '../structures/Base';

/**
 * Hold a bunch of something
 * @extends Map
 * @prop {Class} baseObject The base class for all items
 * @prop {Number?} limit Max number of items to hold
 */
export default class Collection<Value extends Base<Key>, Key = string> extends Map<Key, Value> {
  BaseObject: new () => Value;
  limit?: number;
  /**
   * Construct a Collection
   * @arg {Class} baseObject The base class for all items
   * @arg {Number} [limit] Max number of items to hold
   */
  constructor(baseObject: new (...args: any) => Value, limit?: number, data?: Value[]) {
    super();
    this.BaseObject = baseObject;
    this.limit = limit;
    if (data) {
      for (const item of data) {
        this.add(item);
      }
    }
  }

  /**
   * Update an object
   * @arg {Object} obj The updated object data
   * @arg {String} obj.id The ID of the object
   * @arg {Class} [extra] An extra parameter the constructor may need
   * @arg {Boolean} [replace] Whether to replace an existing object with the same ID
   * @returns {Class} The updated object
   */
  update<V = Value>(obj: V & { id: Key }, extra?: any, replace?: boolean): Value {
    if (obj.id === undefined) {
      throw new Error('Missing object id');
    }
    const item = this.get(obj.id);
    if (!item) {
      return this.add(obj, extra, replace);
    }
    item.update(obj, extra);
    return item;
  }

  /**
   * Add an object
   * @arg {Object} obj The object data
   * @arg {String} obj.id The ID of the object
   * @arg {Class} [extra] An extra parameter the constructor may need
   * @arg {Boolean} [replace] Whether to replace an existing object with the same ID
   * @returns {Class} The existing or newly created object
   */
  add<V = Value>(obj: V & { id: Key }, extra?: any, replace?: boolean): Value {
    if (this.limit === 0) {
      // @ts-expect-error -- baseObject is constructable cause it extends Base
      return obj instanceof this.BaseObject || obj.constructor.name === this.BaseObject.name ? obj : new this.BaseObject(obj, extra);
    }
    if (obj.id === undefined) {
      throw new Error('Missing object id');
    }
    const existing = this.get(obj.id);
    if (existing && !replace) {
      return existing;
    }
    if (!(obj instanceof this.BaseObject || obj.constructor.name === this.BaseObject.name)) {
      // @ts-expect-error -- baseObject is constructable cause it extends Base
      obj = new this.BaseObject(obj, extra);
    }

    this.set(obj.id, obj as unknown as Value);

    if (this.limit && this.size > this.limit) {
      const iter = this.keys();
      while (this.size > this.limit) {
        this.delete(iter.next().value as Key);
      }
    }
    return obj as unknown as Value;
  }

  /**
   * Returns true if all elements satisfy the condition
   * @arg {Function} func A function that takes an object and returns true or false
   * @returns {Boolean} Whether or not all elements satisfied the condition
   */
  every(func: (arg: Value) => boolean): boolean {
    for (const item of this.values()) {
      if (!func(item)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Return all the objects that make the function evaluate true
   * @arg {Function} func A function that takes an object and returns true if it matches
   * @returns {Array<Class>} An array containing all the objects that matched
   */
  filter(func: (arg: Value) => boolean): Value[] {
    const arr = [];
    for (const item of this.values()) {
      if (func(item)) {
        arr.push(item);
      }
    }
    return arr;
  }

  /**
   * Return the first object to make the function evaluate true
   * @arg {Function} func A function that takes an object and returns true if it matches
   * @returns {Class?} The first matching object, or undefined if no match
   */
  find(func: (arg: Value) => boolean): Value | undefined {
    for (const item of this.values()) {
      if (func(item)) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Return an array with the results of applying the given function to each element
   * @arg {Function} func A function that takes an object and returns something
   * @returns {Array} An array containing the results
   */
  map<V = Value>(func: (arg: Value) => V): V[] {
    const arr = [];
    for (const item of this.values()) {
      arr.push(func(item));
    }
    return arr;
  }

  /**
   * Get a random object from the Collection
   * @returns {Class?} The random object, or undefined if there is no match
   */
  random(): Value {
    const index = Math.floor(Math.random() * this.size);
    const iter = this.values();
    for (let i = 0; i < index; ++i) {
      iter.next();
    }
    return iter.next().value!;
  }

  /**
   * Returns a value resulting from applying a function to every element of the collection
   * @arg {Function} func A function that takes the previous value and the next item and returns a new value
   * @arg {any} [initialValue] The initial value passed to the function
   * @returns {any} The final result
   */
  reduce(func: (arg: Value, val: Value) => Value, initialValue?: Value): Value {
    const iter = this.values();
    let val: Value;
    let result: Value = initialValue ?? iter.next().value!;
    while ((val = iter.next().value!) !== undefined) {
      result = func(result, val);
    }
    return result;
  }

  /**
   * Remove an object
   * @arg {Object} obj The object
   * @arg {String} obj.id The ID of the object
   * @returns {Class?} The removed object, or null if nothing was removed
   */
  remove(obj: { id: Key }): Value | null {
    const item = this.get(obj.id);
    if (!item) {
      return null;
    }
    this.delete(obj.id);
    return item;
  }

  /**
   * Returns true if at least one element satisfies the condition
   * @arg {Function} func A function that takes an object and returns true or false
   * @returns {Boolean} Whether or not at least one element satisfied the condition
   */
  some(func: (arg: Value) => boolean): boolean {
    for (const item of this.values()) {
      if (func(item)) {
        return true;
      }
    }
    return false;
  }

  toString(): string {
    return `[Collection<${this.BaseObject.name}>]`;
  }

  toJSON(): Record<string, any> {
    const json: Record<string, any> = {};
    for (const item of this.values()) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      json[`${item.id}`] = item;
    }
    return json;
  }
}
