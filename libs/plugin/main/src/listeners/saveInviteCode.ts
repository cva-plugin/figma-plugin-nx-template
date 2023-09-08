import { Event, type MessageData } from '@cva/shared';
import logger from '@shared/logger';
import { checkBlueprintAndRedirect } from './checkBlueprint';

export async function saveInviteCode(
  event: MessageData<Event.VerifiedInviteCode>
) {
  logger.handlers('Handling SaveLicense', event);
  await figma.clientStorage.setAsync('inviteCode', event.inviteCode);
  checkBlueprintAndRedirect();
}
