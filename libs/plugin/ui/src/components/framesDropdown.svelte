<script lang="ts">
import { generationStore } from "../stores/GenerationStore";
import { optionsStore } from "@ui/stores/OptionsStore";
import { SelectMenu } from "@tokilabs/figma-plugin-sdk";
import { MenuItem } from "@tokilabs/figma-plugin-sdk/dist/components/SelectMenu/index.svelte";


let menuItemArray: MenuItem[] = $generationStore.frames.map((frame) => {
  return {
    id: frame.id,
    value: frame.id,
    label: frame.name,
    group: null,
    selected: false,
  };
});
//use bind:value, with a var bind the data of the selected item
let selectedItem: null | undefined = null;
</script>

<div class="select w-full my-2 pr-2 flex">
  <SelectMenu
    class="select text-xs text-[#333333]"
    bind:menuItems="{menuItemArray}"
    bind:value="{selectedItem}"
    on:change="{(e) => {
      $optionsStore.selectedFrame = e.detail.value;
    }}" />
</div>

<style lang="scss">
.select {
  position: relative;
  display: inline-block;
  width: 100%;
}
</style>
