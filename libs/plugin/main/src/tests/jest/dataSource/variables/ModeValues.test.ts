import { ModeValues } from '@code/metadata/dataSource/variables/ModeValues';

describe('CollectionModes', () => {
  beforeAll(() => {
    const modes = [{ ModeId1: 'Mode1' }, { ModeId2: 'Mode2' }];
    const collection = figma.variables.createVariableCollection('Collection1');
    // @ts-ignore
    collection.id = 'valid-collection-id';
    // @ts-ignore
    collection.modes = modes;
  });
  it('should create an instance with valid collection ID', () => {
    const collectionId = 'valid-collection-id';
    const collectionModes = new ModeValues(collectionId);
    expect(collectionModes).toBeInstanceOf(ModeValues);
  });

  it('should throw an error with an invalid collection ID', () => {
    const collectionId = 'invalid-collection-id';
    expect(() => new ModeValues(collectionId)).toThrow('invalid collection id');
  });

  it('should return mode entries', () => {
    const collectionId = 'valid-collection-id';
    const collectionModes = new ModeValues(collectionId);

    const entries = collectionModes.getEntries();

    expect(entries).toEqual({
      ModeId1: 'Mode1',
      ModeId2: 'Mode2',
    });
  });
});
