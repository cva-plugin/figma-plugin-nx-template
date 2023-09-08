<script lang="ts">
// External Imports
import { ComponentEvents, onMount } from "svelte";
import { Button, SelectMenu } from "@tokilabs/figma-plugin-sdk";
import type { MenuItem } from "@tokilabs/figma-plugin-sdk/dist/components/SelectMenu/index.svelte";

// Internal Imports
import {
  Command,
  IPropertyDefinition,
  IRulesTree,
  IRulesTreeNode,
  LinkedPropertyFilterConfig,
  MessageBus,
} from '@cva/shared';
import { generationStore } from "../stores/GenerationStore";
import { linkPropertiesStore } from "@ui/stores/LinkPropertieStore";
import Modal from "../elements/modal.svelte";
import { filterStore } from "@ui/stores/FilterStore";
import { findNodeById } from "@ui/utils/nodeFunctions";

// Export Props
export let sourceComponent: IRulesTreeNode;

export let showModal: boolean = true;
let className: string = "";
export { className as class };

// Internal Props
let menuItems: Record<string, MenuItem[]> = {
  sourceProperties: [],
  comparisonFunction: [],
  argumentType: [],
  targetComponents: [],
  targetProperties: [],
};
let selectedItems: Record<string, MenuItem | null> = {
  sourceProperty: null,
  comparisonFunction: null,
  argumentType: null,
  targetComponent: null,
  targetProperty: null,
};
let targetComponentPlaceholder = "Select source property";
const rulesTree: IRulesTree = $generationStore.rulesTree;

onMount(() => {
  // Populate source properties
  menuItems.sourceProperties = propertiesToMenuItems(sourceComponent.properties);
  // Reset selected items
  selectedItems.sourceProperty = null;
  selectedItems.targetComponent = null;
  selectedItems.targetProperty = null;
});

function propertiesToMenuItems(
  properties: Record<string, IPropertyDefinition>,
  filter?: (prop: IPropertyDefinition) => boolean
): MenuItem[] {
  return Object.entries(properties)
    .filter((p) => (filter ? filter(p[1]) : true))
    .map(([propertyName, propertyDefinition]) => ({
      value: propertyName,
      label: propertyDefinition.name,
      group: null,
      selected: false,
    }));
}

function targetComponentToMenuItems(
  node: IRulesTreeNode,
  sourceComponent: IRulesTreeNode,
  propName: string
) {
  if (
    node.properties[propName] &&
    node.name != sourceComponent?.name &&
    node.id != sourceComponent?.id
  ) {
    menuItems.targetComponents.push({
      value: node.id,
      label: node.name,
      group: null,
      selected: false,
    });
  }

  node.children.forEach((childRule) => {
    targetComponentToMenuItems(childRule, sourceComponent, propName);
  });

  //set to null to clean if has selected value
  selectedItems.targetComponent = null;

  return menuItems.targetComponents;
}

function linkProperties() {
  // Check if a source property has been selected
  if (!selectedItems?.sourceProperty) {
    MessageBus.sendCommand(Command.ShowMessage, {
      message: "A source property must be selected.",
      error: true,
    });
    return;
  }
  // Check if a target component has been selected
  if (!selectedItems?.targetComponent) {
    MessageBus.sendCommand(Command.ShowMessage, {
      message: "A target component must be selected.",
      error: true,
    });
    return;
  }
  const sourceNodeId = sourceComponent.id;
  const sourceProperty = selectedItems.sourceProperty.value;
  const targetNodeId = findNodeById(rulesTree.root, selectedItems.targetComponent.value)?.id ?? "";
  const targetProperty = sourceProperty;

  const linkProps: LinkedPropertyFilterConfig = {
    type: "LinkedPropertiesFilter",
    sourceNodeId,
    sourceProperty,
    targetNodeId,
    targetProperty,
  };

  // save the linked properties in the store
  filterStore.update((store) => {
    const index = store.filters.findIndex(
      (item) =>
        item.type == linkProps.type &&
        item.sourceNodeId == linkProps.sourceNodeId &&
        item.targetNodeId == linkProps.targetNodeId
    );
    if (index !== -1) {
      filterStore.removeFilter(linkProps);
      return store;
    }
    filterStore.addFilter(linkProps);
    return store;
  });
  //Close modal
  showModal = !showModal;
}

function onSourcePropertyChange(event: any) {
  //populate the targetComponents
  // clean target(comp and prop)

  menuItems.targetComponents.splice(0, menuItems.targetComponents.length);

  if (sourceComponent && selectedItems.sourceProperty) {
    const test = targetComponentToMenuItems(
      rulesTree.root,
      sourceComponent,
      selectedItems.sourceProperty?.value
    );
  }
  updateTargetComponentPlaceholder();
}

function onTargetComponentChange() {
  if (!selectedItems.targetComponent?.value) return;
  // clear selected targetProperty
  selectedItems.targetProperty = null;
  let targetComponent = findNodeById(rulesTree.root, selectedItems.targetComponent?.value);
  if (targetComponent) {
    // Populate properties
    menuItems.targetProperties = propertiesToMenuItems(
      targetComponent?.properties,
      (prop: IPropertyDefinition) => prop.name === selectedItems.sourceProperty.value
    );
  }
}
function updateTargetComponentPlaceholder() {
  if (selectedItems.sourceProperty == null) {
    targetComponentPlaceholder = "Select source property";
  } else if (menuItems.targetComponents.length == 0) {
    targetComponentPlaceholder = "No component found";
  } else {
    targetComponentPlaceholder = "Select component";
  }
}
</script>

<Modal
  class="py-2 px-4 font-semibold leading-4 w-[300px] h-[310px]	text-[12px] tracking-[0.005em] {className}"
  bind:showModal="{showModal}">
  <strong slot="header" class="w-[224px] h-[16px]">Link Properties</strong>
  <!-- Main content -->
  <p class="w-[245px] h-[28px]">
    Linked properties will always have the same value in any generated variant
  </p>
  <div class="space-x-4 w-[245px] h-[16px]">
    <strong class="">
      Limit variations of
      <strong class="text-[#7b61ff] ml-[10px]">
        <!-- SOURCE COMPONENT -->
        {sourceComponent.name}
      </strong>
    </strong>
  </div>
  <div class="linkProps w-[245px] h-[35px]">
    <strong class="w-fit h-[16px]">Making the value of </strong>
    <!-- SOURCE PROPERTIES -->
    <SelectMenu
      placeholder="Property..."
      class="w-[100px] h-[35px] shrink-0"
      bind:menuItems="{menuItems.sourceProperties}"
      bind:value="{selectedItems.sourceProperty}"
      on:change="{onSourcePropertyChange}" />
  </div>

  <div class="linkProps" style="display: none">
    <!-- RULE: COMPARISON FUNCTION -->
    <SelectMenu
      placeholder="Always equal"
      class="w-[100px] h-[35px] ml-0.5 shrink-0"
      disabled="{true}"
      bind:menuItems="{menuItems.comparisonFunction}"
      bind:value="{selectedItems.comparisonFunction}" />

    <strong class="w-[32px] h-[16px]">to the</strong>
    <!-- RULE: ARGUMENT TYPE -->
    <SelectMenu
      placeholder="value of"
      class="w-[100px] h-[35px] shrink-0"
      disabled="{true}"
      bind:menuItems="{menuItems.argumentType}"
      bind:value="{selectedItems.argumentType}" />
  </div>
  <!-- TARGET COMPONENT -->
  <div class="m-0" style="display: flex; flex-direction: column; align-items: left">
    <div>
      <strong class="">Equal to the target component</strong>
    </div>
    <SelectMenu
      bind:placeholder="{targetComponentPlaceholder}"
      class="w-[200px] h-[35px] shrink-0"
      bind:menuItems="{menuItems.targetComponents}"
      bind:value="{selectedItems.targetComponent}"
      on:change="{onTargetComponentChange}" />
  </div>
  <div class="linkProps">
    <strong>property's</strong>
    <!-- TARGET PROPERTIES -->
    <SelectMenu
      placeholder="Select property"
      class="w-[100px] h-[35px] mr-4 shrink-0"
      bind:menuItems="{menuItems.targetProperties}"
      bind:value="{selectedItems.targetProperty}" />
  </div>
  <!-- Buttons -->
  <div class="flex flex-row items-center justify-end w-full gap-2">
    <Button class="mt-2 mr-2 " variant="secondary" on:click="{() => showModal = false}">Cancel</Button>
    <Button class="mx-0 mt-2 " variant="primary" on:click="{() => linkProperties()}">Save</Button>
  </div>
</Modal>

<style lang="scss">
.linkProps {
  display: flex;
  align-items: center;
  gap: 10px;
}
.linkProps strong {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  white-space: nowrap;
}

p {
  color: rgb(0, 0, 0, 0.8);
}
</style>
