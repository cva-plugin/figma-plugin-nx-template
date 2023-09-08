// import { IAssertionResult } from '@code/tests';
import type { IRulesTree } from '@shared/interfaces';
import type { ILayerRef, IPropertyDefinition } from '@shared/types';
import { serialize } from '@shared/utils';
import type { IAssertionResult } from '@shared/testing';

// TODO: check why do we need $id and $type and document it here or remove them
export interface EventDefinition<T extends Event, Message> {
  $id: T;
  $type: 'event';
  message: Message;
}

export interface FigmaEventDefinition<T extends Event, Message> {
  $id: T;
  $type: 'figma-event';
  message: Message;
}

// this enum will be filled in by
// @code/events.ts and @ui/events.ts
export enum Event {
  // ----------- Figma -----------
  //#region Figma Events
  /**
   * This event will trigger when the selection of the current page changes.
   *
   * Note also that changing the selection via the plugin API,
   * then changing it back to its previous value immediately still triggers the event.
   *
   * @remarks
   * This can happen:
   *  - By user action.
   *  - Due to plugin code.
   *  - When the current page changes
   *    (a "currentpagechange" event always triggers a "selectionchange" event).
   *  - When a selected node is deleted.
   *  - When a selected node becomes the child of another selected node
   *    (in which case it is considered indirectly selected,
   *    and is no longer in figma.currentPage.selection)
   */
  SelectionChanged = 'selectionchange',

  /**
   * This event will trigger when the user navigates to a different page,
   * or when the plugin changes the value of figma.currentPage.
   */
  CurrentPageChanged = 'currentpagechange',

  /**
   * This event will trigger when a change is made to the currently open file.
   *
   * The event will be called when nodes/styles are either added, removed, or changed in a document.
   *
   * @remarks
   * Note that DocumentChangeEvent has a documentChanges property with an array of DocumentChanges.
   * Figma will not call the 'documentchange' callback synchronously and will instead batch the
   * updates and send them to the callback periodically
   *
   * There are many different DocumentChange types. Check the Figma API documentation for more details.
   * @see {@link https://go.tokilabs.io/XllWDL|Figma API documentation}
   *
   */
  DocumentChanged = 'documentchange',

  /**
   * This event will trigger when objects outside Figma (such as elements from other browser windows,
   * or files from the local filesystem) are dropped onto the canvas.
   *
   * It can also be triggered by a special pluginDrop message sent from the UI.
   *
   * See the {@link https://go.tokilabs.io/WyOr65|Triggering drop events from the UI} section for more details.
   *
   */
  OnDrop = 'ondrop',

  /**
   * This event will trigger when the plugin is about to close, either from
   * a call to figma closePlugin() or the user closing the plugin via the UI.
   *
   * ! You should use this API only if strictly necessary,
   * ! and run as little code as possible in the callback when doing so.
   *
   * This is a good place to run cleanup actions. For example, some plugins
   * add UI elements in the canvas by creating nodes. These UI elements should
   * be deleted when the plugin is closed.
   *
   * @remarks
   * Note that you don't need to call figma.closePlugin() again in this function.
   *
   * When a user closes a plugin, they expect it to be closed immediately.
   * Having long-running actions in the closing callback prevents the plugin for closing promptly.
   *
   * This is also not the place to run any asynchronous actions (e.g. register callbacks, using
   * await, etc). The plugin execution environment will be destroyed immediately when all the
   * callbacks have returned, and further callbacks will not be called.
   */
  OnClose = 'onclose',

  /**
   * This event is triggered when a plugin is run.
   *
   * Handling the run event is only required for plugins with parameters.
   *
   * @remarks
   * For all plugins it can still be a convenient spot to put your top level code,
   * since it is called on every plugin run.
   *
   * For plugins with parameters, this happens after all parameters have been enter by the user
   * in the quick action UI. For all other plugins this happens immediately after launch.
   */
  OnRun = 'run',

  TimerStarted = 'ontimerstarted',
  TimerPaused = 'ontimerpaused',
  TimerStopped = 'ontimerstopped',
  TimerDone = 'ontimerdone',
  TimerResume = 'ontimerresume',
  TimerAdjust = 'ontimeradjust',

  //#endregion

  //#region CVA Events
  NodeVarianceDisabled = 'code:event/node-variance-disabled',
  NodeVarianceEnabled = 'code:event/node-variance-enabled',
  TreeUpdated = 'code:event/tree-updated',
  FrameListUpdated = 'code:event/frame-list-updated',
  /**
   * Id of the {@link ReadyToGenerateEvent} message
   */
  ReadyToGenerate = 'code:event/ready-to-generate',

  // Ui Events
  SanityCheck = 'code:event/sanity-check',
  SetLoading = 'code:event/loading',
  AskForBlueprint = 'code:event/ask-for-blueprint',
  RequestAccess = 'code:event/request-access',
  VerifiedInviteCode = 'code:event/verified-invite-code',
  InvalidInviteCode = 'code:event/invalid-invite-code',
  // Test Events
  TestPassed = 'test:event/test-passed',
  TestFailed = 'test:event/test-failed',
  TestsEnded = 'test:event/tests-ended',
  //#endregion
}

export interface ReadyToGenerateEvent {
  blueprint: {
    id: string;
    name: string;
  };
  rulesTree: IRulesTree;
  frames: ILayerRef[];
  treeProps: Record<string, IPropertyDefinition>;
  variantCount: number;
}

// this enum will be filled in by
// @code/events.ts and @ui/events.ts
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EventRegistry {
  [Event.SelectionChanged]: FigmaEventDefinition<
    Event.SelectionChanged,
    () => void
  >;
  [Event.CurrentPageChanged]: FigmaEventDefinition<
    Event.CurrentPageChanged,
    () => void
  >;
  [Event.OnClose]: FigmaEventDefinition<Event.OnClose, () => void>;
  [Event.TimerStarted]: FigmaEventDefinition<Event.TimerStarted, () => void>;
  [Event.TimerPaused]: FigmaEventDefinition<Event.TimerPaused, () => void>;
  [Event.TimerStopped]: FigmaEventDefinition<Event.TimerStopped, () => void>;
  [Event.TimerDone]: FigmaEventDefinition<Event.TimerDone, () => void>;
  [Event.TimerResume]: FigmaEventDefinition<Event.TimerResume, () => void>;
  [Event.TimerAdjust]: FigmaEventDefinition<Event.TimerAdjust, () => void>;
  [Event.OnRun]: FigmaEventDefinition<Event.OnRun, RunEvent>;

  [Event.OnDrop]: FigmaEventDefinition<Event.OnRun, DropEvent>;

  [Event.DocumentChanged]: FigmaEventDefinition<
    Event.OnRun,
    DocumentChangeEvent
  >;

  //----------------------------------
  // CVA Events
  [Event.SanityCheck]: EventDefinition<Event.SanityCheck, { message: string }>;
  [Event.AskForBlueprint]: EventDefinition<Event.AskForBlueprint, null>;
  [Event.SetLoading]: EventDefinition<
    Event.SetLoading,
    { figmaUserId: string; inviteCode: string | undefined }
  >;
  [Event.InvalidInviteCode]: EventDefinition<
    Event.InvalidInviteCode,
    { inviteCode: string }
  >;

  [Event.RequestAccess]: EventDefinition<Event.RequestAccess, null>;
  [Event.VerifiedInviteCode]: EventDefinition<
    Event.VerifiedInviteCode,
    { inviteCode: string }
  >;

  [Event.NodeVarianceDisabled]: EventDefinition<
    Event.NodeVarianceDisabled,
    { nodeId: string }
  >;
  [Event.NodeVarianceEnabled]: EventDefinition<
    Event.NodeVarianceEnabled,
    { nodeId: string }
  >;
  [Event.TreeUpdated]: EventDefinition<
    Event.TreeUpdated,
    { mutationTree: IRulesTree }
  >;
  [Event.FrameListUpdated]: EventDefinition<
    Event.FrameListUpdated,
    { frames: ILayerRef[] }
  >;
  [Event.ReadyToGenerate]: EventDefinition<
    Event.ReadyToGenerate,
    ReadyToGenerateEvent
  >;
  [Event.TestPassed]: EventDefinition<Event.TestPassed, IAssertionResult[]>;
  [Event.TestFailed]: EventDefinition<Event.TestFailed, any>;
  [Event.TestsEnded]: EventDefinition<Event.TestsEnded, any>;
}

export type FigmaEventName =
  | ArgFreeEventType
  | 'run'
  | 'drop'
  | 'documentchange';

export function isFigmaEvent(eventName: string): eventName is FigmaEventName {
  if (!eventName) {
    throw new Error(
      `eventName must be one of the Event enum values:${serialize(Event)}`
    );
  }

  return !eventName.includes(':event');
}
