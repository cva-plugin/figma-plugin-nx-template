import { MessageBus, Command, type IRulesTreeNode } from '@cva/shared';

export function onWindowResize(newSize: { width: number; height: number }) {
  MessageBus.sendCommand(Command.ResizeWindow, {
    width: newSize.width,
    height: newSize.height,
  });
}

export function downloadAsFile(
  document: Document,
  filename: string,
  text: string
) {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
  );

  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
