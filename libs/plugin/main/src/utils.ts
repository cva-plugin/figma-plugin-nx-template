import { Command, MessageBus } from '@cva/shared';
import logger from '@shared/logger';
import type {
  BlueprintNode,
  BuildRegexOptions,
  INodeTreeNode,
  IPropertyDefinition,
  IRulesTreeNode,
  MutableNode,
} from '@shared/types';
import { showMessage } from './listeners/showMessage';
import { MatchType } from '@shared/interfaces/IDataSource';

/**
 * Defines the type for a matrix of unknown (N) dimensions
 */
export type NDimensionsMatrix<T> = T[] | NDimensionsMatrix<T>[];

export interface Size {
  width: number;
  height: number;
}

/**
 * Defines the type for a function which can map a property
 */
export type PropMatcher = (prop: IPropertyDefinition) => boolean;

/**
 * Traverses a `node` tree in a *depth-first* manner,
 * passing each node to the specified `visitor` function.
 *
 * Each node is also passed through a `stop` function.
 * If it returns `true`, then the traversal of that node's
 * children will be stopped.
 *
 * @param node - The root node to traverse.
 * @param visitor - The callback function to be called for each node.
 * @param stop - An optional function to stop traversal of a node's children.
 */
export function traverseNode(
  node: INodeTreeNode,
  visitor: (node: INodeTreeNode) => void,
  stop?: (node: INodeTreeNode) => boolean
): void;
export function traverseNode(
  node: SceneNode,
  visitor: (node: SceneNode) => void,
  stop?: (node: SceneNode) => boolean
): void;
export function traverseNode<TNode extends SceneNode | INodeTreeNode>(
  node: TNode,
  visitor: (node: TNode) => void,
  stop?: (node: TNode) => boolean
): void {
  const realNode = 'node' in node ? node.node : node;

  // Base case: if the node is removed or the stop function returns true
  if ('removed' in realNode && realNode?.removed === true) {
    return;
  }
  // Recursively traverse children if they exist
  if ('children' in node) {
    for (const childNode of node.children) {
      traverseNode(
        childNode as any /* sem tempo, irnmão */,
        visitor as any /* SEM TEMPO, IRNMÃO */,
        stop as any /* VSF TS */
      );
    }
  }

  if (typeof stop === 'function' && stop(node)) {
    return;
  }
  // Call the visitor function for the current node
  visitor(node);
}

/**
 * Finds the blueprint node in a collection of nodes.
 *
 * ! @TODO: Add support for multiple blueprints (via ComponentSet)
 * @remarks
 * If the collection contains a single node of type `COMPONENT`, it is assumed to be the blueprint node.
 * Otherwise, the function will traverse the collection and look for the first node with the name `.base`.
 * If a node with that name is found and it is of type `COMPONENT`, it is assumed to be the blueprint node.
 *
 * @param nodes - The collection of nodes to search for the blueprint node.
 * @returns The blueprint node, or `null` if it could not be found.
 */

export function findBlueprint(
  nodes: readonly SceneNode[]
): BlueprintNode | null {
  if (nodes.length === 1 && ['COMPONENT'].includes(nodes[0].type)) {
    return nodes[0] as BlueprintNode;
  } else {
    let blueprintNode!: SceneNode | null;

    // Look for the first .base component or ComponentSet in the collection
    for (const parent of nodes) {
      traverseNode(
        parent,
        (n) => {
          if (n.name === '.base') {
            blueprintNode = n;
          }
        },
        () => blueprintNode != null
      );

      if (blueprintNode?.type === 'COMPONENT') {
        return blueprintNode;
      }
    }
  }

  return null;
}
/**
 * Creates a regular expression based on the given pattern and options.
 *
 * ! NOTE: setting `matchType` to `MatchType.All` will return a regular expression that matches everything.
 */
export function buildRegex(
  pattern: string,
  options: BuildRegexOptions
): RegExp {
  if (MatchType.All === options.matchType) {
    return new RegExp('.*');
  }

  switch (options.matchType) {
    case MatchType.StartsWith:
      pattern = '^' + pattern;
      break;
    case MatchType.EndsWith:
      pattern = pattern + '$';
      break;
    case MatchType.Exact:
      pattern = '^' + pattern + '$';
      break;
    case MatchType.Contains:
      pattern = '.*' + pattern + '.*';
      break;
  }
  return new RegExp(pattern, `${!options.caseSensitive ? 'i' : ''}`);
}

export type VariableCriteria = {
  namePattern?: RegExp;
  collectionId?: string;
  modeId?: string;
};

/**
 * Retrieves the scene node located at the specified path within a given context.
 * Widely used to make changes to blueprint clones.
 * @param path - The path to the desired node, represented as a string or an array of strings.
 * @param context - The context within which to search for the node.
 * @returns The scene node located at the specified path, or null if not found.
 */
export function getFigmaNodeAtPath(
  path: string | string[],
  context: SceneNode & ChildrenMixin
): SceneNode | null {
  if (!Array.isArray(path)) {
    path = path.split('.');
  }
  if (path.length === 1 && path[0] === context.name) {
    return context;
  }

  const next = context.children.find((child) => child.name === path[0]);

  if (next === undefined) {
    return null;
  }

  if (path.length === 1 && next.name === path[0]) {
    return next;
  }

  if ('children' in next) {
    return getFigmaNodeAtPath(path.slice(1), next as SceneNode & ChildrenMixin);
  }

  return null;
}
/**
 * Retrieves the path from a current node to the root node.
 * @param currentNode - The current node for which to calculate the path.
 * @param root - The root node that serves as the topmost ancestor.
 * @returns An array of strings representing the path from the current node to the root node.
 */
export function figmaNodePath(
  currentNode: SceneNode,
  root: SceneNode
): string[] {
  const path: string[] = [];

  function traverse(currentNode: SceneNode, root: SceneNode) {
    path.push(currentNode.name);

    if (currentNode.parent && currentNode.parent.id != root.id) {
      traverse(currentNode.parent as SceneNode, root);
    }
  }

  traverse(currentNode, root);
  return path.reverse();
}
export function nTimes<T>(n: number, fn: (i: number) => T): T[] {
  const res = [];

  for (let i = 0; i < n; i++) {
    res.push(fn(i));
  }
  return res;
}

/**
 * @deprecated Use `serialize` from `@shared/utils` instead.
 */
export function nodeToJSON(node: Record<string, unknown>) {
  const out: Record<string, unknown> = {};

  for (const k in node) {
    const value: unknown = node[k];

    if (node[k] && typeof node[k] !== 'function') {
      if (Array.isArray(value)) {
        out[k] = value.map((item) => nodeToJSON(item));
      }

      if (value != null && typeof value == 'object') {
        out[k] = nodeToJSON(value as Record<string, unknown>);
      }

      out[k] = node[k];
    }
  }
}

export function countPropValues(prop: IPropertyDefinition) {
  return prop.variantOptions?.length ?? prop.preferredValues?.length ?? 2;
}

export function capitalize(str = '') {
  return str.replace(/\b[a-z]/, (char) => char.toUpperCase());
}

export function capitalizeAllWords(str = '') {
  return str.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

export type MapFunc<T = unknown> = (val: T, index?: number, arr?: T[]) => T;

/*
 * @internal
 * By @svallory
 * I do NOT understand how ANY of these logarithmic types work
 * But they do, so I'm not touching them kkkk kidding.
 *
 * "You may not need the 'how' if you know the 'why' - The Alchemist
 *
 * These logarithmic types are used to efficiently:
 * - Allow definitions of fixed lengths tuples
 * -
 *
 * Long term goal is to use these types to define a Matrix type to be used in the plugin
 * to represent the grid of variants.
 *
 * Desired usage:
 * ```
 *  const grid = new Matrix<number, number>();
 *  grid[0][0] = 1;
 *
 *  // this should show hints for the grid function parameters
 *  // so we know that the first parameter is "row" and the second is "column"
 *  const cell = grid(0, 0);
 * ```
 * https://stackoverflow.com/a/6021027/112731
 */
type BuildPowersOf2LengthArrays<
  N extends number,
  R extends never[][]
> = R[0][N] extends never
  ? R
  : BuildPowersOf2LengthArrays<N, [[...R[0], ...R[0]], ...R]>;

type ConcatLargestUntilDone<
  N extends number,
  R extends never[][],
  B extends never[]
> = B['length'] extends N
  ? B
  : [...R[0], ...B][N] extends never
  ? ConcatLargestUntilDone<
      N,
      R extends [R[0], ...infer U] ? (U extends never[][] ? U : never) : never,
      B
    >
  : ConcatLargestUntilDone<
      N,
      R extends [R[0], ...infer U] ? (U extends never[][] ? U : never) : never,
      [...R[0], ...B]
    >;

type Replace<R extends unknown[], T> = { [K in keyof R]: T };

type TupleOf<T, N extends number> = number extends N
  ? T[]
  : {
      [K in N]: BuildPowersOf2LengthArrays<K, [[never]]> extends infer U
        ? U extends never[][]
          ? Replace<ConcatLargestUntilDone<K, U, []>, T>
          : never
        : never;
    }[N];

export type Vector<Length extends number> = TupleOf<number, Length>;
export type Matrix<Rows extends number, Columns extends number> = TupleOf<
  TupleOf<number, Columns>,
  Rows
>;

/**
 * Returns an array of the current Figma's document local variables that match the given criteria.
 *
 * @param criteria - The criteria to filter variables by.
 * @returns An array of variables that match the given criteria.
 */
export function findVariablesByCriteria(criteria: VariableCriteria) {
  return (
    figma.variables
      // list ALL variables in the current file
      .getLocalVariables()
      // filters an array. It will only
      // keep the elements for which the given function returns true
      .filter((variable) => {
        // returns true if the variable belongs to "Colorful Themes" collection
        return (
          // collectionId is null or equal to variable.collectionId
          (criteria.collectionId == undefined ||
            variable.variableCollectionId === criteria.collectionId) &&
          // if namePattern is defined...
          (criteria.namePattern == undefined ||
            criteria.namePattern.test(variable.name))
        );
      })
  );
}
