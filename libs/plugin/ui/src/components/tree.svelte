<script lang="ts">
// import InfoBox from "./info.svelte";
import TreeItem from "./treeItem.svelte";
import linkConnected from "../assets/linkConnected.svg";

import { generationStore } from "../stores/GenerationStore";
</script>

<div class="generationTree">
  <h2 class="pl-[2px] mb-[10px] mt-[20px] font-bold text-[13px] leading-4">Generation Tree</h2>
  <div class="info flex self-stretch p-4 rounded-md shadow bg-white">
    <div class="block h-full">
      <slot>
        <img src="{linkConnected}" alt="Connected Link" class="w-[6px] h-[14px] mt-1" />
      </slot>
    </div>
    <div class="flex flex-col pl-3 text-xs">
      <h3 class="text-[13px] m-0 p-0 font-bold">Link Properties</h3>
      <p class="text-[11px] m-0 p-0">
        You can link properties to make sure their values match each other in all generated
        variants.
      </p>
      <a class="self-end text-blue-400 text-[#18A0f8]" href="localhost:3000">next tip</a>
    </div>
  </div>

  <div class="tree pt-[10px] pb-[10px]">
    <div class="items">
      <TreeItem data="{$generationStore.rulesTree.root}" />
    </div>
  </div>
</div>

<style lang="scss">
div.info.flex {
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15));
}
</style>
