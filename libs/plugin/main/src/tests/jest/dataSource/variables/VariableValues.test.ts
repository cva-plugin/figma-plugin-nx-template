import { VariableValues } from '@code/metadata/dataSource/variables/VariableValues';
import { Variables } from '../../data/variablesObjects';

function createVariableValues(objects: Object[]) {
  const collection = figma.variables.createVariableCollection('collection1');
  //@ts-ignore
  collection.id = 'collection-valid-id';
  //@ts-ignore
  collection.addMode('Value 1');
  collection.addMode('Value 2');
  // collection.modes = [
  //   {
  //     mode1: 'Value 1',
  //     mode2: 'Value 2',
  //   },
  // ];
  objects.map((obj) => {
    const color = figma.variables.createVariable(
      '',
      'collection-valid-id',
      'BOOLEAN'
    );
    Object.entries(obj).map(([name, value]) => {
      // @ts-ignore
      color[name] = value;
    });
  });
}
describe('VariableValues', () => {
  beforeAll(() => {
    createVariableValues(Variables);
  });
  describe('getEntries', () => {
    it('should return all current variable values', () => {
      const variableId = '1:2';

      const dataSource = new VariableValues(variableId);
      const result = dataSource.getEntries();

      expect(result).toEqual({
        '1:2': 'variable1',
        '3:4': 'variable2',
      });
    });

    it('should throw an error for non-existing variable', () => {
      const variableId = 'non_existing_id';

      const createDataSource = () => new VariableValues(variableId);

      expect(createDataSource).toThrowError(
        `The specified variable id "${variableId}" does not exist`
      );
    });
  });
});
