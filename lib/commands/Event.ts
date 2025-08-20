/* eslint-disable @typescript-eslint/method-signature-style */
import type Events from '../interfaces/Events';
import Base from '../structures/Base';

interface Event<Context> {
  handle(context: Context, arg?: any, arg2?: any, arg3?: any): PromiseLike<any> | any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Event<Context> extends Base {
  event: keyof Events | string;
}

export default Event;
