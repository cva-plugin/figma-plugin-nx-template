/**
 * CVA - Component Variance Authority
 * Figma Plugin
 *
 * Is a plugin that allows you to create component variants
 * automatically and easily. Instead of creating each variant
 * manually, you can define the how the parts of your component
 * will vary and CVA will do the rest.
 *
 * @packageDocumentation
 */
import { VarianceTree } from '@code/metadata/tree/VarianceTree';
import { type ILayerRef, MessageBusSingleton } from '@cva/shared';

import logger from '@shared/logger';
import { serialize } from '@shared/utils';

/**
 * @internal
 * The CvaPluginImpl class implements the singleton pattern,
 * so that there's only one instance of the plugin at any given time.
 * The plugin's singleton instance is exported as the `plugin` variable.
 *
 * Here's a basic summary of how the plugin works:
 * - The { @see updateUI } method is called to show the plugin's UI.
 *
 * - The plugin watches for selection changes in Figma and uses { @see findBlueprint } method
 *   to check if the selected `SceneNode` or some parent node can be used to create variants.
 *
 * - If a master node is found, { @see buildVarianceTree } will be called to create a { @see VarianceTree } instance.
 *   The { @see VarianceTree } instance traverses the component tree and creates a tree of components that vary
 *   and is also used to calculate the number of variants that will be created.
 *
 * - The { @see VarianceTree } instance is used to show the user the components in the master rooted tree
 *   that can vary, allowing the user to disable some of them before creating the variants.
 *
 * - When the user clicks the "Generate Variants" button, we check the amount of variants that will be generated.
 *   If that number is greater than the limit set in Settings.generation.warnThreshold, a confirmation dialog
 *   is shown asking the user to confirm.
 *
 * - If the user clicks "OK", the { @see generateVariants } method is called to create the variants.
 */
class CvaPluginSingleton {
  private static instance: CvaPluginSingleton;

  private tree: VarianceTree | null = null;

  private _bus: MessageBusSingleton;

  public get bus(): MessageBusSingleton {
    logger.plugin('getting the bus %O', serialize(this._bus));
    return this._bus;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    this._bus = MessageBusSingleton.getInstance();
  }

  public static getInstance(): CvaPluginSingleton {
    // Looks like eslint cannot predict this may be called multiple times
    // in case of module cache gotchas
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!CvaPluginSingleton.instance) {
      CvaPluginSingleton.instance = new CvaPluginSingleton();
    }

    return CvaPluginSingleton.instance;
  }

  public listFrames(): ILayerRef[] {
    return figma.currentPage
      .findChildren((node) => node.type === 'FRAME')
      .map((fr) => {
        return {
          id: fr.id,
          name: fr.name,
        };
      });
  }
}

const singleton = CvaPluginSingleton.getInstance();

// ensure the API is never changed
// -------------------------------
Object.freeze(singleton);

// export the singleton instance only
// -----------------------------
export const CvaPlugin = singleton;
export default singleton;
