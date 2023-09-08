import type { Command, MessageData } from '@cva/shared';
import logger from '@shared/logger';

export function enableNodeVariance(
  command: MessageData<Command.EnableNodeVariance>
) {
  logger.handlers('Handling EnableNodeVariance', command);
}
