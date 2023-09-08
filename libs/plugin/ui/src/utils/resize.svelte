<script lang="ts">
import { MessageBus, Command } from '@cva/shared';

let corner: SVGSVGElement;
// let w = 250;
// let h = 250;

function resizeWindow(e: PointerEvent) {
  MessageBus.sendCommand(Command.ResizeWindow, { height: e.clientY, width: e.clientX });
}

function onPointerDown(e: PointerEvent) {
  // console.log(e);
  corner.onpointermove = resizeWindow;
  corner.setPointerCapture(e.pointerId);
}

function onPointerUp(e: PointerEvent) {
  // console.log(e);
  corner.onpointermove = null;
  corner.releasePointerCapture(e.pointerId);
}
</script>

<div id="main">
  <svg
    id="corner"
    bind:this="{corner}"
    width="14"
    height="12"
    viewBox="0 0 12 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    on:pointerdown="{onPointerDown}"
    on:pointerup="{onPointerUp}">
    <path d="M16 0V16H0L16 0Z" fill="none"></path>
    <path d="M6.22577 16H3L16 3V6.22576L6.22577 16Z" fill="#8C8C8C"></path>
    <path d="M11.8602 16H8.63441L16 8.63441V11.8602L11.8602 16Z" fill="#8C8C8C"></path>
  </svg>
</div>

<style>
#main {
  height: 100%;
}

#corner {
  position: absolute;
  right: 1px;
  bottom: 2px;
  cursor: nwse-resize;
}
</style>
