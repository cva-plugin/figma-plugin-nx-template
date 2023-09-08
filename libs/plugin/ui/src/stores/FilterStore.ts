import type {
  DisableVarianceFilterConfig,
  FilterConfig,
  LinkedPropertyFilterConfig,
  IPropertyDefinition,
  IRulesTreeNode,
} from '@cva/shared';
import { Command, MessageBus } from '@cva/shared';
import { writable } from 'svelte/store';

export interface FilterOptions {
  filters: FilterConfig[];
  idDeletedProperties: string[];
  variantCount: number;
  treeProps: Record<string, IPropertyDefinition>;
}

function FilterStore() {
  const { subscribe, set, update } = writable<FilterOptions>();

  const updateProps = (nodeId?: string) => {
    update((store) => {
      // 1. Initialize a variable 'total' with a value of 1
      let total = 1;
      // 2. Check if 'nodeId' is defined (optional parameter)
      //because if it is not defined then it must be added
      if (nodeId) {
        store.idDeletedProperties.push(nodeId);
      }
      // 3. this map checks if the value should be counted or not in the total of variants
      Object.values(store.treeProps).map((prop) => {
        if (!store.idDeletedProperties.includes(prop.target.id)) {
          switch (prop.type) {
            case 'VARIANT':
              total = total * (prop.variantOptions.length || 1);
          }
        }
      });
      store.variantCount = total;
      return store;
    });
  };
  const checkAmountProperties = () => {
    let allowedProperties = 0;
    let blockedProperties = 0;
    let allProperties = 0;
    subscribe((store) => {
      Object.values(store.treeProps).map((prop) => {
        if (!store.idDeletedProperties.includes(prop.target.id)) {
          allowedProperties++;
        } else {
          blockedProperties++;
        }
        allProperties++;
      });
      return store;
    });
    return { allowedProperties, blockedProperties, allProperties };
  };
  // const removeFromDeletedProperties = (nodeId: string) => {
  //   filterStore.update((store) => {
  //     const index = store.idDeletedProperties.findIndex((item) => item == nodeId);
  //     if (index !== -1) {
  //       store.idDeletedProperties.splice(index, 1);
  //     }
  //     return store;
  //   });
  // };
  const addFilter = (filter: FilterConfig): void => {
    filterStore.update((store) => {
      if (filter.type == 'LinkedPropertiesFilter') {
        //it should be added and update total variants
        store.filters.push(filter);
        // update the variant count
        updateProps(filter.targetNodeId);
      }
      if (filter.type == 'DisableVarianceFilter') {
        //it should be added and update total variants
        const disabledNodeFilters = findDisabledNodeFilter(filter.nodeId);
        const linkedFilters = findLinkPropsFilter(filter.nodeId);
        if (linkedFilters.length > 0) {
          removeFilter(filter);
          MessageBus.sendCommand(Command.ShowMessage, {
            message: 'Your property has been disabled, so it has been unlinked',
          });
        }
        //checks if the node has already been disabled so as not to disable it again
        if (disabledNodeFilters.length > 0) {
          return store;
        }
        // update the variant count
        updateProps(filter.nodeId);

        store.filters.push(filter);
      }
      return store;
    });
  };

  const removeFilter = (filter: FilterConfig): void => {
    update((store) => {
      //checks if the value already exists in the filters array.
      //because if it exists it will be removed
      if (filter.type == 'LinkedPropertiesFilter') {
        const index = store.filters.findIndex(
          (item) =>
            item.type == filter.type &&
            item.sourceNodeId == filter.sourceNodeId &&
            item.targetNodeId == filter.targetNodeId
        );
        //remove the value of the array of id's of deleted properties
        //and update the store to show the correct value of variants
        if (index !== -1) {
          const i = store.idDeletedProperties.findIndex(
            (deleted) => deleted == filter.targetNodeId
          );
          store.idDeletedProperties.splice(i, 1);
          store.filters.splice(index, 1);
          updateProps();
        }
      }
      if (filter.type == 'DisableVarianceFilter') {
        const index = store.filters.findIndex(
          (item) => item.type == filter.type && item.nodeId == filter.nodeId
        );
        const i = store.idDeletedProperties.findIndex(
          (deleted) => deleted == filter.nodeId
        );
        //remove the value of the array of id's of deleted properties
        //and update the store to show the correct value of variants
        if (index !== -1 && i !== -1) {
          store.idDeletedProperties.splice(i, 1);
          store.filters.splice(index, 1);
          filterStore.updateProps();
        }
      }
      return store;
    });
  };
  //take filters to all children of the father and changes the "varianceDisabled"
  const takeDisableVarianceFilters = (
    tree: IRulesTreeNode,
    filters: DisableVarianceFilterConfig[]
  ): DisableVarianceFilterConfig[] => {
    filters.push({
      type: 'DisableVarianceFilter',
      nodeId: tree.id,
    });
    tree.varianceDisabled = !tree.varianceDisabled;
    tree.children.map((child) => {
      if (tree.varianceDisabled != child.varianceDisabled) {
        filters.push({
          type: 'DisableVarianceFilter',
          nodeId: child.id,
        });
        child.varianceDisabled = !child.varianceDisabled;
      }
      if (child.children.length > 0) {
        child.children.map((c) => {
          filters.push(...takeDisableVarianceFilters(c, filters));
        });
      }
    });
    return filters;
  };
  //check if the filter exists in store
  const findLinkPropsFilter = (nodeId: string) => {
    let selectedFilters: LinkedPropertyFilterConfig[] = [];
    filterStore.update((store) => {
      store.filters.map((filter) => {
        if (
          filter.type == 'LinkedPropertiesFilter' &&
          (filter.sourceNodeId == nodeId || filter.targetNodeId == nodeId)
        ) {
          selectedFilters.push(filter);
        }
      });
      return store;
    });
    return selectedFilters;
  };
  //check if the filter exists in store
  const findDisabledNodeFilter = (nodeId: string) => {
    let selectedFilters: DisableVarianceFilterConfig[] = [];
    filterStore.update((store) => {
      store.filters.map((filter) => {
        if (filter.type == 'DisableVarianceFilter' && filter.nodeId == nodeId) {
          selectedFilters.push(filter);
        }
      });
      return store;
    });
    return selectedFilters;
  };

  return {
    subscribe,
    set,
    update,
    addFilter,
    removeFilter,
    updateProps,
    takeDisableVarianceFilters,
    findDisabledNodeFilter,
    checkAmountProperties,
  };
}

export const filterStore = FilterStore();
