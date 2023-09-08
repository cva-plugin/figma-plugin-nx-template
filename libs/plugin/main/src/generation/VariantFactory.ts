import { type FigmaNode } from '@shared/types';
import { VarianceTree } from '@code/metadata/tree/VarianceTree';
import { Grid } from '@code/layout/Grid';
import { VariantRecipe } from '@code/metadata/Variant';

import logger from '@shared/logger';
import { GridParameters, arrangeGrid } from '@code/layout';

export type VariantCache = FigmaNode[] | VariantCache[];

export class VariantFactoryImpl {
  static _instance: VariantFactoryImpl | null = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance() {
    if (VariantFactoryImpl._instance == null) {
      VariantFactoryImpl._instance = new VariantFactoryImpl();
    }

    return VariantFactoryImpl._instance;
  }

  public async generateVariants(
    tree: VarianceTree,
    outputFrame: FrameNode
  ): Promise<void> {
    // Step 1: Create the grid to arrange the variants
    if (!tree.properties)
      throw Error('Your tree has no properties to be varied');
    const grid: Grid = new Grid(tree, outputFrame);
    logger.generation('Grid created', grid);
    const promises: Promise<void>[] = [];
    const comps: ComponentNode[] = [];
    // Step 2: Create a new variant
    for (let col = 0; col < grid.cols; col++) {
      for (let row = 0; row < grid.rows; row++) {
        promises.push(
          new Promise<void>((resolve) => {
            const columnHeads = grid.getHeaderValuesAt(col, row);
            const recipe = new VariantRecipe(tree.root.node, columnHeads);
            const variant = this.createVariant(recipe);
            comps.push(variant);
            grid.addVariant(variant, col, row);
            resolve();
          })
        );
      }
    }

    return Promise.all(promises).then(async () => {
      // Step 3: Align the variants
      grid.arrangeVariants();
      const compSet = figma.combineAsVariants(comps, outputFrame);
      //test function to arrange variants
      if (Object.keys(compSet.componentPropertyDefinitions).length >= 2) {
        const props: GridParameters = {
          row: Object.keys(compSet.componentPropertyDefinitions)[0] ?? '',
          col: Object.keys(compSet.componentPropertyDefinitions)[1] ?? '',
          hGroup: Object.keys(compSet.componentPropertyDefinitions)[2] ?? '',
        };
        await arrangeGrid(props, compSet);
      }
    });
  }
  public async generateDocumentationModeVariants(
    tree: VarianceTree,
    outputFrame: FrameNode
  ): Promise<void> {
    // Step 1: Create the grid to arrange the variants
    if (!tree.properties)
      throw Error('Your tree has no properties to be varied');
    const grid: Grid = new Grid(tree, outputFrame);
    console.log('thre Tree: ', tree);
    const instances: InstanceNode[] = [];
    logger.generation('Grid created', grid);
    const promises: Promise<void>[] = [];
    // Step 2: Create a new variant
    for (let col = 0; col < grid.cols; col++) {
      for (let row = 0; row < grid.rows; row++) {
        promises.push(
          new Promise<void>((resolve) => {
            const columnHeads = grid.getHeaderValuesAt(col, row);
            const recipe = new VariantRecipe(tree.root.node, columnHeads);
            const instance = tree.root.node.createInstance();
            const variant = this.createVariantDocumentationMode(
              instance,
              recipe
            );
            instances.push(variant);
            grid.addVariant(variant, col, row);
            resolve();
          })
        );
      }
    }

    return Promise.all(promises).then(async () => {
      // Step 3: Align the variants
      grid.arrangeVariants();
      // Object.values(tree.properties).map((n) => {
      //     n.name = `${figmaNodePath(n.target, tree.root.node).join('/')}:${n.name}`
      // });

      // // const nameProp = variantProps(instances[0].name)
      // if (Object.keys(tree.properties).length >= 2) {
      //   const props: GridParameters = {
      //     row: Object.keys(tree.properties)[0] ?? '',
      //     col: Object.keys(tree.properties)[1] ?? '',
      //     hGroup: Object.keys(tree.properties)[2] ?? '',
      //   };
      //   await arrangeGridDocumentationMode(props, instances, tree.properties, outputFrame);
      // }
    });
  }
  private createVariantDocumentationMode(
    instance: InstanceNode,
    recipe: VariantRecipe
  ): InstanceNode {
    logger.generation('Creating variant from recipe', recipe);
    const componentName: string[] = [];
    recipe.steps.forEach((step) => {
      logger.generation('Setting value', step.value, 'in', instance);
      const namePart = step.rule.apply(instance, step.value);
      if (namePart) {
        componentName.push(namePart);
      }
    });
    logger.generation('name', componentName.join(','), 'in', instance);
    instance.name = componentName.join(',');
    return instance;
  }

  private createVariant(recipe: VariantRecipe): ComponentNode {
    logger.generation('Creating variant from recipe', recipe);
    const componentName: string[] = [];
    const comp = recipe.blueprint.clone() as ComponentNode;
    // TODO: add variance through effects
    recipe.steps.forEach((step) => {
      logger.generation('Setting value', step.value, 'in', comp);
      const namePart = step.rule.apply(comp, step.value);
      if (namePart) {
        componentName.push(namePart);
      }
    });
    logger.generation('name', componentName.join(','), 'in', comp);
    comp.name = componentName.join(',');
    return comp;
  }
}

export const VariantFactory = VariantFactoryImpl.getInstance();
