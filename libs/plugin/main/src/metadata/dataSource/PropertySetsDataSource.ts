import { PropertySet } from '@cva/shared';

export class PropertySetsDataSource {
  private propertySets: PropertySet[];

  constructor(propertySets: PropertySet[]) {
    this.propertySets = propertySets;
  }

  // Method to get all property sets
  getEntries(): PropertySet[] {
    return this.propertySets;
  }
}
