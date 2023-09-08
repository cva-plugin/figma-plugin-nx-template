<script lang="ts">
import { Command, MessageBus } from '@cva/shared';
import FramesDropdown from "./framesDropdown.svelte";
import { generationStore } from "@ui/stores/GenerationStore";
import { optionsStore } from "@ui/stores/OptionsStore";
import { downloadAsFile } from "@ui/utils";
// import Button from "../elements/button.svelte";
import { Button, Checkbox } from "@tokilabs/figma-plugin-sdk";
import { filterStore } from "@ui/stores/FilterStore";
export let numberOfVariants = $generationStore.variantCount;
export let documentationMode = $optionsStore.documentationMode;
filterStore.subscribe((store) => {
  numberOfVariants = store.variantCount;
});
function generateVariants() {
  const propertiesCount = filterStore.checkAmountProperties();
  if (propertiesCount.allowedProperties > 1) {
    MessageBus.sendCommand(Command.Generate, {
      blueprintId: $generationStore.blueprint.id,
      outputFrameId: $optionsStore.selectedFrame,
      documentationMode: $optionsStore.documentationMode,
      filters: $filterStore.filters,
    });
  } else {
    if (propertiesCount.blockedProperties > 0 && propertiesCount.allProperties > 1) {
      MessageBus.sendCommand(Command.ShowMessage, {
        message:
          "Disable filters or add more properties to your blueprint so that variants can be generated.",
        error: true,
      });
    }
    if (propertiesCount.allProperties < 1) {
      MessageBus.sendCommand(Command.ShowMessage, {
        message: "Add more properties to your blueprint so that variants can be generated.",
        error: true,
      });
    }
  }
}
function updateDocumentationMode() {
  optionsStore.update((store) => {
    store.documentationMode = documentationMode;
    return store;
  });
}
</script>

<div class="outputOptions flex flex-col p-[10px] border text-center">
  <h2 class="text-[13px] leading-[16px] font-bold mt-[0px] mb-[10px]">Output Options</h2>
  <FramesDropdown />

  <div
    class="bg-[--lightPurple] text-[--deepPurple] w-[298px] h-[32px] my-2.5 w-fit py-1 pr-2 pl-1 text-xs flex flex-row rounded-2xl leading-[19px] self-center justify-center items-center gap-2 text-center">
    <div
      class="icon h-[20px] flex flex-row justify-center items-center rounded-[17px] py-0.5 px-2 text-xs font-medium leading-[19px] text-center">
      🎉
    </div>
    <div
      class="icon h-[20px] flex flex-row justify-center items-center rounded-[17px] py-0.5 text-xs font-medium leading-[19px] text-center">
      You are about to generate
    </div>
    <div
      class="icon w-[30px] h-[20px] flex flex-row justify-center items-center rounded-[17px] py-0.5 text-xs font-medium leading-[19px] text-center">
      <strong>
        {numberOfVariants}
      </strong>
    </div>
    <div
      class="icon h-[20px] flex flex-row justify-center items-center rounded-[17px] py-0.5 text-xs font-medium leading-[19px] text-center">
      variants!
    </div>
  </div>
  <!--
    for v 0.2:
    <Checkbox bind:checked="{documentationMode}" on:change="{updateDocumentationMode}"
    >Documentation mode</Checkbox>
  -->
  <Button
    class="flex flex-row items-center py-2 px-3 gap-2 rounded-md w-fit h-8 m-2.5 self-center text-[11px]"
    on:click="{generateVariants}">Generate Variants</Button>
  <!-- <Button class="cursor-pointer "  on:click="{generateVariants}">Generate Variants</Button> -->

  <!-- <Button class="cursor-pointer" on:click="{treeAsJSON}">↓ tree as JSON</Button> -->
</div>
