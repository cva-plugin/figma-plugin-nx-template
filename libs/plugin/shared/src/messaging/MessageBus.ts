import * as evtHandler from './handler';
import logger from '@shared/logger';
import { type CommandRegistry } from '@shared/messaging/commands';
import { type EventRegistry, isFigmaEvent } from '@shared/messaging/events';

import { type CommandHandlers, type DeregisterFn, type EventListeners } from './types';

/**
 * A simple message bus implementation which magically works in both the main thread and the plugin UI.
 * No need to worry about sending messages in the right direction.
 *
 * @remarks
 * * Important: This class is a singleton but the main thread and the plugin UI are separate environments
 * * so each have their own instance.
 *
 * `@create-figma-plugin` package handles sending messages in the right direction.
 * I.e. it will send messages to the plugin UI when the emitter is the main thread,
 * or to the main thread when the emitter is the plugin UI.
 */
export class MessageBusSingleton {
  private static instance?: MessageBusSingleton;

  protected $handlers: Partial<CommandHandlers> = {};

  protected $listeners: Partial<EventListeners> = {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): MessageBusSingleton {
    // Looks like eslint cannot predict this may be called multiple times
    // in case of module cache gotchas
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!MessageBusSingleton.instance) {
      MessageBusSingleton.instance = new MessageBusSingleton();
    }

    return MessageBusSingleton.instance;
  }

  public handleCommand<Id extends keyof CommandHandlers>(
    command: Id,
    handler: CommandHandlers[Id]
  ): DeregisterFn {
    logger.events(`Registering handler for ${command}:`, handler.name);

    this.$handlers[command] = handler;

    return evtHandler.on(command, handler);
  }

  public sendCommand<Id extends keyof CommandHandlers>(
    command: Id,
    data: CommandRegistry[Id]['message']
  ): CommandRegistry[Id]['result'] | undefined {
    //if it is a test command and the test logger is not activated, do not run the tests
    if (command.toString().startsWith('test') && !logger.test.enabled) {
      return;
    }
    logger.events(`Delegating command ${command}`);
    evtHandler.emit(command, data);

    return undefined;
  }

  public listenToEvent<Id extends keyof EventListeners>(
    event: Id,
    listener: EventListeners[Id]
  ): DeregisterFn {
    logger.events(`Registering listener for ${event}:`, listener.name);

    this.$listeners[event] = listener;

    if (isFigmaEvent(event as string)) {
      // There's no gain in tricking TS to think that the listener
      // has the correct type, so we just cast it to any
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      figma.on(event as any, listener as any);
      return (): void => {
        // ditto
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        figma.off(event as any, listener as any);
      };
    }

    return evtHandler.on(event, listener);
  }

  public publishEvent<Id extends keyof EventListeners>(
    event: Id,
    data: EventRegistry[Id]['message']
  ): void {
    logger.events(`Publishing event ${event}`, data);

    evtHandler.emit(event, data);
  }
}

const singleton = MessageBusSingleton.getInstance();

// ensure the API is never changed
// -------------------------------
Object.freeze(singleton);

// export the singleton instance only
// -----------------------------

export const MessageBus = singleton;
export default MessageBusSingleton;
