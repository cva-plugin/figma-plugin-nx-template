<script lang="ts">
import { slide } from "svelte/transition";

// Types
import { Command, type IRulesTreeNode, MessageBus, DisableVarianceFilterConfig } from '@cva/shared';

// Components
import LinkPropsModal from "./linkPropsModal.svelte";
import DataSourceModal from "./dataSource/dataSourceModal.svelte";
// Assets
import fourDiamonds from "../assets/fourDiamonds.svg";
import diamond from "../assets/diamond.svg";
import linkOpen from "../assets/linkOpen.svg";
import linkConnected from "../assets/linkConnected.svg";
import arrow from "../assets/arrow.svg";

import { Checkbox } from "@tokilabs/figma-plugin-sdk";
import { generationStore } from "@ui/stores/GenerationStore";
import { filterStore } from "@ui/stores/FilterStore";

// Props
export let data: IRulesTreeNode;
export let level: number = 0;
export let enabled: boolean = false;
export let check: boolean = true;
export let enableChildren: boolean = false;
generationStore.subscribe((store) => {
  data = takeData(store.rulesTree.root) ?? data;
});

let linkImage = linkOpen;
filterStore.subscribe((store) => {
  linkImage = store.filters.some(
    (filter) =>
      filter.type == "LinkedPropertiesFilter" &&
      (filter.sourceNodeId == data.id || filter.targetNodeId == data.id)
  )
    ? linkConnected
    : linkOpen;
});

const linkPropertiesModal = {
  show: false,
  open: () => {
    //if the property is disabled then it cannot be linked!
    if (data.varianceDisabled) {
      MessageBus.sendCommand(Command.ShowMessage, {
        message: "Your property is disabled and cannot be linked!",
      });
    } else {
      linkPropertiesModal.show = true;
    }
  },
  close: () => {
    linkPropertiesModal.show = false;
  },
};
const dataSourceModal = {
  show: false,
  open: () => {
    //if the property is disabled then it cannot be linked!
    if (data.varianceDisabled) {
      MessageBus.sendCommand(Command.ShowMessage, {
        message: "Your property is disabled and cannot be accessed!",
      });
    } else {
      dataSourceModal.show = true;
    }
  },
  close: () => {
    dataSourceModal.show = false;
  },
};

let showDropdown = true;
let rotateChevron = true;

function takeData(tree: IRulesTreeNode): IRulesTreeNode | undefined {
  if (tree.id == data.id) {
    return tree;
  }
  tree.children.map((child) => {
    takeData(child);
  });
}

function toggleDropdown() {
  rotateChevron = !rotateChevron;
  showDropdown = !showDropdown;
}

const image = data.type == "COMPONENT" ? fourDiamonds : diamond;

function disableVariance() {
  enableChildren = enabled;
  //se o node já tiver sido linkado o link é removido. IMPP
  const filters: DisableVarianceFilterConfig[] = filterStore.takeDisableVarianceFilters(data, []);
  filters.map((filter) => filterStore.addFilter(filter));
}
function enableVariance() {
  enableChildren = enabled;
  const filters: DisableVarianceFilterConfig[] = filterStore.takeDisableVarianceFilters(data, []);
  filters.map((filter) => filterStore.removeFilter(filter));

  return null;
}

function updateMixedValue(data: IRulesTreeNode) {
  const path = [...data.path];
  path.splice(path.length - 1, 1);
  generationStore.update((store) => {
    data.mixed = data.children.some(
      (child) => child.varianceDisabled !== data.varianceDisabled || child.mixed
    );
    const parent =
      path.length > 0
        ? generationStore.getNodeByPath(store.rulesTree.root, path)
        : store.rulesTree.root;
    if (parent) {
      parent.mixed = parent.children.some(
        (child) => child.varianceDisabled !== parent.varianceDisabled || child.mixed
      );
      if (data.path.length > 0) {
        updateMixedValue(parent);
      }
    }

    return store;
  });
}

function toggleCheckbox() {
  enabled = !check;
  if (enabled) {
    disableVariance();
  } else {
    enableVariance();
  }
  updateMixedValue(data);
}
// Handlers
</script>

<div class="flex flex-col pl-1">
  <div class="flex flex-row items-center justify-between h-8">
    <div class="contentLeft">
      <div class="w-4 h-4 flex text-gray-400">
        {#if data.children.length > 0}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <img
            src="{arrow}"
            class="transform transition-transform duration-200 cursor-pointer w-2 h-2 mt-1"
            alt="arrow svg"
            class:rotate-90="{rotateChevron}"
            on:click="{() => toggleDropdown()}" />
          <!-- <MdArrowDropDown /> -->
        {/if}
        <img
          src="{image}"
          class=" itemTree pl-[4px] w-4 h-4"
          class:changeColor="{enabled}"
          alt="Checkmark Icon" />
        <span
          class=" itemTree flex-none text-[11px] tracking-[.005em] pl-[10px] text-[--deepPurple] {level ==
          0
            ? 'font-semibold'
            : 'font-normal'}"
          class:changeColor="{enabled}">
          {data.name}
        </span>
      </div>
    </div>
    <div class="flex items-center text-gray-700 mr-7">
      <div class="w-4 p-0 m-0 inline-block mr-7">
        <Checkbox
          class="checkbox"
          bind:checked="{check}"
          mixed="{data.mixed}"
          on:change="{toggleCheckbox}" />
      </div>
      <div class="w-4 inline-block ml-2">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
          class="cursor-pointer"
          src="{linkImage}"
          alt="Chain link open"
          on:click="{dataSourceModal.open}" />
      </div>
    </div>
  </div>
  {#if data.children && showDropdown}
    {#each data.children as child}
      <div class=" pl-[20px]" transition:slide>
        <svelte:self
          data="{child}"
          father="{data}"
          check="{check}"
          level="{level + 1}"
          enabled="{enableChildren}"
          enableChildren="{enableChildren}" />
      </div>
    {/each}
  {/if}

  {#if linkPropertiesModal.show}
    <LinkPropsModal
      class="border-none rounded-lg shadow-lg shadow-black w-[277px] h-[236px] "
      bind:showModal="{linkPropertiesModal.show}"
      sourceComponent="{data}" />
  {/if}
  {#if dataSourceModal.show}
    <DataSourceModal class="border-none rounded-lg shadow-lg shadow-black w-[340px] h-[340px]" bind:showModal="{dataSourceModal.show}" />
  {/if}
</div>

<style lang="scss">
.contentLeft {
  color: var(--deepPurple);
}
.rotate-90 {
  transform: rotate(90deg);
}

.changeColor {
  filter: invert(0%) sepia(95%) saturate(20%) hue-rotate(39deg) brightness(93%) contrast(107%);
}

// :global(.checkbox) {
//   border: 1px solid red;
//   label {
//     padding: 0;
//     display: none;
//   }
// }
</style>
