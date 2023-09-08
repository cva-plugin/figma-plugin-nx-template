import logger from '@shared/logger';
import { Command, Event, MessageBus } from '@cva/shared';
import { optionsStore } from '@ui/stores/OptionsStore';
import { postData } from '@ui/utils/postMethod';

/**
 * check InviteCode ONLY when user send InviteCode
 * @param inviteCode
 * @returns
 */
export async function checkSentInviteCode(
  inviteCode?: string,
  figmaId?: string
) {
  logger.command('Checking the license');
  // if  has license will run always when the plugin is start
  if (inviteCode) {
    const response: any = await await postData(
      'https://cva.design/validate-invite',
      {
        invite_code: inviteCode,
        figma_id: figmaId,
      }
    );
    if (!response.ok) {
      MessageBus.sendCommand(Command.ShowMessage, {
        message: 'this invitation code is invalid.',
        error: true,
      });
      return false;
    } else {
      // sends an event saying that the invitation code has been verified
      MessageBus.publishEvent(Event.VerifiedInviteCode, { inviteCode });
      return true;
    }
  }
  return true;
}
/**
 * check the inviteCode ALWAYS when the plugin starts
 * @param inviteCode
 * @returns
 */
export async function checkInviteCode(inviteCode?: string) {
  if (inviteCode) {
    // let { data, error } = await supabase.from('waitlist').select().eq('invite_code', inviteCode);
    // if (error || (data && !data[0])) {
    //   // the invite code is invalid
    //   MessageBus.sendCommand(Command.ShowMessage, {
    //     message: 'Your invite code are invalid',
    //     error: true,
    //   });
    // MessageBus.publishEvent(Event.InvalidInviteCode, { inviteCode });
    // optionsStore.update((store) => {
    //   store.screen = 'RequestAccess';
    //   return store;
    // });
    // }
  } else {
    optionsStore.update((store) => {
      store.screen = 'RequestAccess';
      return store;
    });
  }
}
