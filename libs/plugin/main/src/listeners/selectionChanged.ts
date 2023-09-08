import { Event, type MessageData } from '@cva/shared';
import logger from '@shared/logger';
import { checkBlueprintAndRedirect } from './checkBlueprint';

export function onSelectionChanged(e: MessageData<Event.SelectionChanged>) {
  logger.init('Selection changed');
  checkBlueprintAndRedirect();
}

export default onSelectionChanged;
