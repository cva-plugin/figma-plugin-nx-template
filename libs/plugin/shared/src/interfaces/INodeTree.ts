import type { BlueprintNode, IPropertyDefinition, MutableNode, Variant } from '@shared/types';
import type { ISpecification } from '@shared/patterns/specification';
import type { IRulesTreeNode, IRulesTree } from './IRulesTreeNode';

/**
 * The variance tree ONLY contains nodes that can be mutated to generate new variants
 */

export interface INodeTree extends IRulesTree {
  root: INodeTreeNode<BlueprintNode>;
  properties: Record<string, IPropertyDefinition>;
  // filter: ISpecification<Variant> | null;
}

/**
 * ITreeNode represents a MutableNode node in an IVarianceTree
 */
export interface INodeTreeNode<TNode extends BlueprintNode | MutableNode = MutableNode>
  extends IRulesTreeNode {
  node: TNode;
  children: INodeTreeNode[];
}
