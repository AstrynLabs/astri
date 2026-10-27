import type { ClientEvents } from '../../types';
import type { CommandClient } from '../client';

/** A client event listener for a {@link CommandClient}, which passes it the client's context. */
export abstract class EventHandler<Context = CommandClient, Event extends keyof ClientEvents = keyof ClientEvents> {
    abstract readonly event: Event;
    /** Run only for the first emit after being registered. */
    once = false;

    abstract handle(context: Context, ...args: ClientEvents[Event]): unknown;
}
