import { Command, type MessageData } from '@cva/shared';

export async function showMessage(data: MessageData<Command.ShowMessage>) {
  const notify = data.error
    ? figma.notify(data.message, { error: data.error })
    : figma.notify(data.message);
  setTimeout(() => notify.cancel(), 4000);
}
