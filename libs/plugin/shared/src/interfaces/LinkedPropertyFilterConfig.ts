/**
 * Configuration object for a filter that links two properties.
 */

export type LinkedPropertyFilterConfig = {
  /** The type of filter. */
  type: 'LinkedPropertiesFilter';
  /** The ID of the node that contains the source property. */
  sourceNodeId: string;
  /** The name of the source property. */
  sourceProperty: string;
  /** The ID of the node that contains the target property. */
  targetNodeId: string;
  /** The name of the target property. */
  targetProperty: string;

  /**
   * Rule object that specifies how the linked properties should be compared.
   * There's no reason to encapsulate this inner type if it isn't used elsewhere.
   */
  // rule: {
  //   comparisonFunction: string;
  //   argumentType: string;
  // };
};
