import { IDataSource } from '@cva/shared';

/**
 * Takes the variable id to get all possible values to this variable.
 *
 */
export class VariableValues implements IDataSource {
  constructor(public readonly variableId: string) {
    const variable = figma.variables.getVariableById(variableId);

    if (!variable) {
      throw new Error(
        `The specified variable id "${variableId}" does not exist`
      );
    }

    this.variableId = variableId;
  }
  /**
   * Returns the all current variable values.
   */
  getEntries() {
    const variable = figma.variables.getVariableById(this.variableId);

    if (!variable) {
      throw new Error(
        `The specified variable id "${this.variableId}" does not exist`
      );
    }

    return Object.entries(variable.valuesByMode).reduce(
      (total: Record<string, VariableValue>, variable) => {
        total[variable[0]] = variable[1];
        return total;
      },
      {}
    );
  }
}
