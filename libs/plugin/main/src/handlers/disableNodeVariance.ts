import type { Command, MessageData } from '@cva/shared';
import logger from '@shared/logger';

export function disableNodeVariance(
  command: MessageData<Command.DisableNodeVariance>
) {
  logger.handlers('Handling DisableNodeVariance', command);
}
