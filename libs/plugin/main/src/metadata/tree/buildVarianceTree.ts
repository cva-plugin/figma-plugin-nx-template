import type { BlueprintNode, INodeTreeNode } from '@cva/shared';
import { createVarianceNode } from './node-utils';
import { traverseNode } from '@code/utils';
import { isNodeMutant } from './node-utils';
import logger from '@shared/logger';
import { doubléMaker } from '@shared/doubleMaker';

/**
 * Builds a variance tree (a tree containing only the nodes that may vary)
 * from a blueprint node and returns the root of the tree.
 *
 * @TODO: We are checking things multiple times (e.g. isNodeInvariant)
 *        we should create a tree of placeholder nodes and store the
 *        information we need in them in a single pass, then prune and
 *        replace the remaining nodes with ITreeNodes
 *
 * @param {BlueprintNode} blueprint - The blueprint node to build the variance tree from.
 * @return {VarianceNode} The root of the built variance tree.
 */

export function buildVarianceTree<
  TRoot extends ComponentNode | ComponentSetNode
>(blueprint: TRoot): INodeTreeNode<TRoot> {
  // const doublé = doubléMaker(blueprint);
  // logger.generation('Blueprint::', doublé);

  // const root = createVarianceNode(doublé);
  // logger.generation('Tree root::', root);
  // logger.generation('Doublé::', doublé.accessed);
  const root = createVarianceNode(blueprint);
  const placeholders: { [key: string]: INodeTreeNode[] } = {};

  traverseNode(
    root.node,
    (node: SceneNode) => {
      if (!node.parent) {
        return;
      } else {
        placeholders[node.parent.id] = placeholders[node.parent.id] ?? [];
      }

      const imMutant = isNodeMutant(node),
        iHaveKids = placeholders[node.id]?.length;

      if (imMutant) {
        // @hack: review makeTreeNode params restrictions and remove cast (or not)
        const treeNode = createVarianceNode(node);

        // Do I have children I need to pay pension to?
        if (iHaveKids) {
          treeNode.children.push(...placeholders[node.id]);
          delete placeholders[node.id];
        }

        // wait for daddy to come pick me up
        placeholders[node.parent.id].push(treeNode);
      } else {
        if (iHaveKids) {
          // send the kids to grandpa
          placeholders[node.parent.id].push(...placeholders[node.id]);
          delete placeholders[node.id];
        }
      }
    },
    (node: SceneNode) => {
      // if node is VarianceTree root
      if (node.id === root.node.id) {
        // grab the kids and let's go!
        root.children.push(...placeholders[node.id]);
        return true;
      }

      return false;
    }
  );

  return root;
}
