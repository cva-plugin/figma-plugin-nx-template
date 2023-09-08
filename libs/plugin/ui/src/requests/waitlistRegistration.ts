import { Command, MessageBus } from '@shared/messaging';
import { postData } from '@ui/utils/postMethod';

export async function register(email: string, figmaId: string) {
  const registry: any = await (
    await postData('https://cva.design/waitList', {
      email: email,
      figma_id: figmaId,
    })
  ).json();

  if (registry.error) {
    if (registry.status == 409) {
      MessageBus.sendCommand(Command.ShowMessage, {
        message: `Your email: ${email} already registered.`,
        error: true,
      });
      return false;
    }
    MessageBus.sendCommand(Command.ShowMessage, {
      message: `Error: ${registry.data.error.message}.`,
      error: true,
    });
    return false;
  }
  MessageBus.sendCommand(Command.ShowMessage, { message: 'You are registered on our waitlist.' });
  return true;
}

export default register;
