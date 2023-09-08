import type { FigmaNode } from "@shared/types";

/**
 * Represents a rule for generating content based on a Figma node blueprint.
 */
export abstract class GenerationRule {
  /**
   * @param blueprint The blueprint component to generate variants from.
   */
  constructor(public readonly blueprint: FigmaNode) {}

  /**
   * Applies the generation rule to a variant of the Figma node.
   * 
   * @param variant The variant of the Figma node to apply the rule to.
   * @param value The value to apply the rule with.
   */
  abstract apply(variant: SceneNode, value: string | boolean): string |void;
}
