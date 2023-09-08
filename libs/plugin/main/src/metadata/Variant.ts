import { GenerationRule } from '@code/generation/rules';
import { PropertyRule } from '@code/generation/rules/PropertyRule';
import { type ColumnHead, Header } from '@code/types/Header';
import { type BlueprintNode } from '@cva/shared';

export interface Step {
  rule: GenerationRule;

  type: string;

  value: string | boolean;
}

/**
 * Represents a specific Variant defining the values for
 * each component property (via PropertyRule) and attribute values specified
 * via other mutations (e.g. special effects)
 */
export class VariantRecipe {
  public steps: Step[] = [];

  constructor(
    public blueprint: BlueprintNode,
    headerValues: { header: Header; column: ColumnHead }[]
  ) {
    headerValues.forEach(({ header, column }) => {
      if (header.rule instanceof PropertyRule) {
        this.steps.push({
          rule: header.rule,
          type: header.rule.constructor.name,
          value: column.value,
        });
      }
    });
  }

  // private applyProperty(rule: PropertyRule, value: string | boolean) {
  //   this.steps.set(rule.apply(), {
  //     [rule.property.name]: {
  //       type: rule.property.type,
  //       value,
  //       preferredValues: rule.property.preferredValues,
  //     },
  //   });
  // }
}
