import { CvaPlugin, PluginWindow } from '@cva/main';
import { Command, MessageBus } from '@cva/shared';
import {
  disableNodeVariance,
  enableNodeVariance,
  generateVariants,
  linkProperties,
  resizeWindow,
  updateTree,
} from '@code/handlers';

import { Event } from '@cva/shared';

import logger from '@shared/logger';
import { checkBlueprintAndRedirect } from './listeners/checkBlueprint';
import onSelectionChanged from './listeners/selectionChanged';
// import checkLicense from '../ui/checkLicense';
import { saveInviteCode } from './listeners/saveInviteCode';
import { removeInvalidInviteCode } from './listeners/removeInvalidInviteCode';
import { showMessage } from './listeners/showMessage';
// import register from './handlers/waitlistRegistration';
// import * as test from './metadata/dataSource/ColorStyleDataSource.test';
import { runTests } from './tests/runner';

/**
 * @internal
 * This is the entry point of the plugin.
 * Figma will call this function when the plugin is run.
 * `plugin` contains the plugin's singleton instance and
 * the {@link CvaPluginImpl.pluginModal} method is called
 * to show the plugin's UI.
 */

console.clear();
logger.init('Initializing');

// @TODO: We should try to wrap the method that builds the tree
// between `figma.skipInvisibleInstanceChildren = true` and `false`
// That way we don't miss hidden instance layers but still optimize
// the traversal in all other cases.
//
// This makes operations like document traversal much faster
// because all node properties and methods to skip over invisible nodes
// see: https://www.figma.com/plugin-docs/api/properties/figma-skipinvisibleinstancechildren/
figma.skipInvisibleInstanceChildren = false;

// Registering handlers
MessageBus.listenToEvent(Event.SelectionChanged, onSelectionChanged);
MessageBus.listenToEvent(Event.VerifiedInviteCode, saveInviteCode);
MessageBus.listenToEvent(Event.InvalidInviteCode, removeInvalidInviteCode);
MessageBus.handleCommand(Command.ShowMessage, showMessage);
MessageBus.handleCommand(Command.ResizeWindow, resizeWindow);
MessageBus.handleCommand(Command.Generate, generateVariants);
MessageBus.handleCommand(Command.UpdateTree, updateTree);
MessageBus.handleCommand(Command.DisableNodeVariance, disableNodeVariance);
MessageBus.handleCommand(Command.EnableNodeVariance, enableNodeVariance);
MessageBus.handleCommand(Command.LinkProperties, linkProperties);

//TEST
MessageBus.handleCommand(Command.RunTests, runTests);

figma.showUI(__html__, { themeColors: false, width: 400, height: 600 });

CvaPlugin.bus.listenToEvent(Event.OnRun, () => {
  logger.init('Showing askingForBlueprint screen');
  PluginWindow.askForBlueprint();
  logger.init('Starting up plugin');

  checkBlueprintAndRedirect();
});
