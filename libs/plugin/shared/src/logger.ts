import { type Debug } from 'debug';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
import Debugger from 'debug';

// Enable debug output for the following namespaces:
Debugger.enable('cva:parsing:tree,cva:test');
// Debugger.enable('cva:events:listeners,cva:parsing:*,cva:ui');
// Debugger.enable('cva:*, cva:variants,cva:generation,cva:parsing:tree');
// Debugger = () => true;

// TODO: MONKEY PATCH TO USE COLORS
// Debugger.use

// This is necessary because the typings are out of date in Jan 7th, 2023
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
(Debugger as any).useColors = () => true;

// type CallableConsole = typeof console & CallableFunction;

export const logger = {
  init: Debugger('cva:init'),
  command: Debugger('cva:command'),
  handlers: Debugger('cva:command:handlers'),
  events: Debugger('cva:events'),
  listeners: Debugger('cva:events:listeners'),
  ui: Debugger('cva:ui'),
  plugin: Debugger('cva:plugin'),
  tree: Debugger('cva:parsing:tree'),
  generation: Debugger('cva:generation'),
  variants: Debugger('cva:variants'),
  filters: Debugger('cva:filters'),
  test: Debugger('cva:test')
};

export default logger;
// public getLargestSmallestHeader() {
//   let largest = this.headers[0];
//   let smallest = this.headers[1];
//   this.headers.map((h) => {
//     if (h.columnHeads.length > largest.columnHeads.length) {
//       largest = h;
//     }
//     if (h.columnHeads.length < smallest.columnHeads.length) {
//       largest = h;
//     }
//   });
//   return { largest, smallest };
// }
