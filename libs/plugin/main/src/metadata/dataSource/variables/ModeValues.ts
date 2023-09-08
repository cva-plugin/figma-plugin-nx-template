import { IDataSource } from '@cva/shared';

/**
 * Takes the id of the VariableCollection to get the modes
 */
export class ModeValues implements IDataSource {
  private collectionId: string;

  constructor(collectionId: string) {
    let variableCollection =
      figma.variables.getVariableCollectionById(collectionId);
    if (!variableCollection) {
      throw Error('invalid collection id');
    }
    this.collectionId = collectionId;
  }
  /**
   * Returns the current modes of the variableCollection
   */
  getEntries(): Record<string, string> {
    let variableCollection = figma.variables.getVariableCollectionById(
      this.collectionId
    );
    if (!variableCollection) {
      throw Error('invalid collection id');
    }

    return variableCollection.modes.reduce(
      (record: Record<string, string>, mode) => {
        record[mode.modeId] = mode.name;
        return record;
      },
      {}
    );
  }
}
