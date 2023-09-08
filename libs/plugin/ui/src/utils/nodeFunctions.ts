import type { IRulesTreeNode } from '@cva/shared';

export function findNodeById(
  treeRoot: IRulesTreeNode,
  id: string
): IRulesTreeNode | undefined {
  if (treeRoot.id == id) {
    return treeRoot;
  }

  let target: IRulesTreeNode | undefined;

  treeRoot.children.map((childRule) => {
    const foundTarget = findNodeById(childRule, id);

    if (foundTarget) {
      target = foundTarget;
    }
  });

  return target;
}
