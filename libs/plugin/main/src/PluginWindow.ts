// import Settings from "@shared/Settings";
import { Event, MessageBus, ReadyToGenerateEvent } from '@cva/shared';

//
export abstract class PluginWindow {
  public static showGenerationScreen(data: ReadyToGenerateEvent) {
    MessageBus.publishEvent(Event.ReadyToGenerate, data);
  }

  public static async askForBlueprint() {
    const figmaUserId =
      figma.currentUser?.id == null ? '' : figma.currentUser?.id;
    if (figmaUserId == null) throw Error('needs a figmaId');
    const inviteCode: string | undefined = await figma.clientStorage.getAsync(
      'inviteCode'
    );
    MessageBus.publishEvent(Event.SetLoading, { figmaUserId, inviteCode });
    MessageBus.publishEvent(Event.AskForBlueprint, null);
  }

  public static requestAccess() {
    MessageBus.publishEvent(Event.RequestAccess, null);
  }
}
