import { MissingRequirementForGeneration, ErrorMessages } from '@code/errors';
import { VarianceTree } from '@code/metadata';
import { type Command, type MessageData } from '@cva/shared';
import logger from '@shared/logger';

export function linkProperties(command: MessageData<Command.LinkProperties>) {
  logger.filters('Handling LinkProperties', command);
  // MessageBus.publish(Event.TreeUpdated, {});
}
