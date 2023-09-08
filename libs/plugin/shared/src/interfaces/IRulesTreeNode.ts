import type { IPropertyDefinition } from '@shared/types';
import type { LinkedPropertyFilterConfig } from './LinkedPropertyFilterConfig';

/**
 * Configuration object for the rules tree.
 */
export interface IRulesTree {
  /** The root mutation rule. */
  root: IRulesTreeNode;
}

/**
 * Interface for a mutation rule.
 */
export interface IRulesTreeNode {
  /** The ID of the node. */
  id: string;
  /** The name of the node. */
  name: string;
  /** The type of the node. */
  type: string;
  /** The children of the mutation rule. */
  children: IRulesTreeNode[];
  /** The path from the root to this node */
  path: string[];
  /** The filters of the mutation rule. */
  filters: LinkedPropertyFilterConfig[];
  /** The properties of this node */
  properties: Record<string, IPropertyDefinition>;
  /** Shows whether that node is disabled for generation or not */
  varianceDisabled: boolean;

  mixed?: boolean
}

