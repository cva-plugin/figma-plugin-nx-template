import { writable } from 'svelte/store';

export interface IDataSourceStore {
  Color: {
    name: string;
    value: string;
  }[];

  Boolean: {
    name: string;
    value: boolean;
  }[];

  Number: {
    name: string;
    value: number;
  }[];

  Text: {
    name: string;
    value: string;
  }[];
}

function DataSourceStore() {
  const { subscribe, set, update } = writable<IDataSourceStore>({
    Color: [],
    Boolean: [],
    Number: [],
    Text: [],
  });
  const basicDataSource = (type: string) => {
    if (type == 'Color') {
      return '000000';
    } else if (type == 'Boolean') {
      return 'true';
    } else if (type == 'Number') {
      return '0';
    } else {
      return 'Text here';
    }
  };
  return {
    subscribe,
    set,
    update,
    basicDataSource,
  };
}

export const dataSourceStore = DataSourceStore();
