export class SetOf<TItem extends VariableValue> {
  private values: Set<TItem>;

  // todo: figure out how to support enums where both key and value matter
  constructor(values: TItem[]) {
    this.values = new Set<TItem>(values);
  }

  addValue(value: TItem) {
    this.values.add(value);
  }

  removeValue(value: TItem) {
    this.values.delete(value);
  }

  getAllValues(): TItem[] {
    return Array.from(this.values);
  }
}
