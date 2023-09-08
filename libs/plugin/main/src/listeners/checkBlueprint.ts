import CvaPlugin from '@code/CvaPlugin';
import { PluginWindow } from '@code/PluginWindow';
import { VarianceTree } from '@code/metadata';
import { findBlueprint } from '@code/utils';
import { logger } from '@shared/logger';

/**
 * Checks if a blueprint node is selected and shows the appropriate screen.
 * If no blueprint is selected, it shows the "ask for blueprint" screen.
 * If a blueprint is selected, it shows the "generation" screen.
 */
export function checkBlueprintAndRedirect(): boolean {
  // check if there's a blueprint node selected
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    logger.init('Blueprint Not Found, showing ask for blueprint screen');
    PluginWindow.askForBlueprint();
    return false;
  }

  logger.listeners('Attempting to find blueprint');

  const blueprint = findBlueprint(selection);

  if (blueprint === null) {
    logger.init('Blueprint Not Found, showing ask for blueprint screen');
    PluginWindow.askForBlueprint();
    return false;
  }

  logger.init('Blueprint Found, showing generation screen');

  const tree = new VarianceTree(blueprint);

  logger.tree('Generated tree', tree);

  PluginWindow.showGenerationScreen({
    blueprint: { id: blueprint.id, name: blueprint.name },
    rulesTree: tree.asRulesTree(),
    frames: CvaPlugin.listFrames(),
    treeProps: tree.properties,
    variantCount: tree.countVariants(),
  });
  return true;
}
