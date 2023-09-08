import { type PropertyDefinition } from '@code/metadata';
import { Header, type ColumnHead } from '@code/types/Header';

export class PropertyHeader extends Header {
  // constructor(public readonly propertyRule: GenerationRule) {
  //   super(
  //     propertyRule,
  //     propertyRule.property.name,
  //     MutationKind.Property,
  //     PropertyHeader.getColumnHeads(propertyRule.property)
  //   );
  // }

  public static getColumnHeads(prop: PropertyDefinition): ColumnHead[] {
    return prop.getPossibleValues().map((value) => ({
      value,
      label: typeof value === 'string' ? value : value ? '✅' : '❌',
    }));
  }
}
