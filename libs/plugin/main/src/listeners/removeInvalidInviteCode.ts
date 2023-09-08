import { Event, type MessageData } from '@cva/shared';
import logger from '@shared/logger';

export async function removeInvalidInviteCode(
  event: MessageData<Event.InvalidInviteCode>
) {
  logger.handlers('Handling SaveLicense', event);
  await figma.clientStorage.deleteAsync('inviteCode');
  return;
}
