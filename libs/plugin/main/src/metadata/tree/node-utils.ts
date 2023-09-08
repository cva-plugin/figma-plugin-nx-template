import type { BlueprintNode, INodeTreeNode, MutableNode } from '@cva/shared';
import { findCompProperties } from './findCompProperties';
import { traverseNode } from '@code/utils';

export function createVarianceNode<
  TRoot extends ComponentNode | ComponentSetNode | BlueprintNode | MutableNode
>(node: TRoot): INodeTreeNode<TRoot> {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    node: node,
    children: [],
    path: [],
    properties: findCompProperties(node),
    filters: [],
    varianceDisabled: false,
  };
}

/**
 * Checks if the given node is of type {@link MutableNode}
 *
 * {@link MutableNode}s can be modified either by changing it's
 * property values (InstanceNode) or it's property definition
 * defaultValues
 *
 * @param node The Figma SceneNode to check
 */
export function isNodeMutant(node: SceneNode): node is MutableNode {
  if (['INSTANCE', 'COMPONENT', 'COMPONENT_SET'].includes(node.type)) {
    if (
      Object.keys(node.componentPropertyReferences ?? {}).length > 0 ||
      Object.keys((node as InstanceNode).componentProperties ?? {}).length > 0
    ) {
      return true;
    }

    return false;
  }

  return false;
}

/**
 * Returns true if the node is not mutant and does not
 * have any mutant descendants
 *
 * ! @TODO: Memoize this function
 *
 * @param node the node to check
 * @returns
 */
export function isNodeInvariant(node: SceneNode): boolean {
  return (
    (node && !isNodeMutant(node)) ||
    ('children' in node && node.children.every((c) => isNodeInvariant(c)))
  );
}

/**
 * Searches the tree for a node with the given id
 */
export function findDescendantNodeById(
  id: string,
  scope: INodeTreeNode
): INodeTreeNode | undefined {
  let found: INodeTreeNode | undefined;

  traverseNode(scope, (node) => {
    if (node.id === id) {
      found = node;
      return false; // Stop traversing when the node is found
    }
    return true; // Continue traversing
  });

  return found;
}
