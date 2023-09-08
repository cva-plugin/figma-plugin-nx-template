import { Command, type MessageData } from '@cva/shared';

export function resizeWindow({
  width,
  height,
}: MessageData<Command.ResizeWindow>) {
  width = Math.max(300, Math.floor(width + 5));
  height = Math.max(400, Math.floor(height + 5));

  figma.ui.resize(width, height);
  // figma.clientStorage.setAsync('size', { width, height });
}

export default resizeWindow;
