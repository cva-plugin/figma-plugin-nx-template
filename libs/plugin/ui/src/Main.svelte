<script lang="ts">
import "./main.scss";
import { onMount } from "svelte";
import GenerateVariant from "./pages/GenerateVariants.svelte";
import logger from "@shared/logger";
import TestResults from "./pages/TestResults.svelte";
import WaitingForBlueprint from "./pages/WaitingForBlueprint.svelte";
import { MessageBus, Event, type MessageData, EventListeners, Command } from '@cva/shared';

import { generationStore } from "./stores/GenerationStore";
import RequestAccess from "./pages/RequestAccess.svelte";
import { optionsStore } from "./stores/OptionsStore";
import { checkInviteCode } from "./requests/checkInviteCode";
import { filterStore } from "./stores/FilterStore";

export let testing: boolean = false;
export let testFilterPattern: string = "";

onMount(async () => {
  if (testing) {
    MessageBus.sendCommand(Command.RunTests, {
      pattern: testFilterPattern,
    });
  }
});

function logCalls<Id extends keyof EventListeners>(eventType: Id, listener: EventListeners[Id]) {
  return (data: any) => {
    logger.events(`Received event: ${eventType} with ${data != null ? "NO DATA" : "data"}`, data);
    listener(data);
  };
}

MessageBus.listenToEvent(
  Event.AskForBlueprint,
  logCalls(Event.AskForBlueprint, () => changeScreen("AskForBlueprint"))
);

MessageBus.listenToEvent(
  Event.SetLoading,
  logCalls(Event.SetLoading, (data) => {
    optionsStore.update((store) => {
      store.figmaUserId = data.figmaUserId;
      store.inviteCode = data.inviteCode;
      return store;
    });

    checkInviteCode($optionsStore.inviteCode);
  })
);

MessageBus.listenToEvent(
  Event.ReadyToGenerate,
  logCalls(Event.ReadyToGenerate, (data) => changeScreen("ReadyToGenerate", data))
);

MessageBus.listenToEvent(Event.RequestAccess, () => changeScreen("RequestAccess"));

MessageBus.listenToEvent(
  Event.TreeUpdated,
  logCalls(Event.TreeUpdated, (data) => {
    logger.ui("Event.TreeUpdated");
    generationStore.update((store) => {
      store.rulesTree = data.mutationTree;
      return store;
    });
  })
);

function changeScreen(screenName: string, data?: MessageData<Event.ReadyToGenerate>) {
  if ($optionsStore.screen == "ReadyToGenerate" && !data) {
    return;
  }
  logger.ui("screen", $optionsStore.screen, "screenName", screenName);

  if ($optionsStore.screen != "RequestAccess") {
    logger.ui(`Event.${screenName}`);

    optionsStore.update((store) => {
      //Test
      MessageBus.sendCommand(Command.Test1, {});
      store.screen = screenName;
      return store;
    });
    if (!data) {
      return;
    }
    generationStore.set(data);
    filterStore.set({
      filters: [],
      idDeletedProperties: [],
      //use this variant count
      variantCount: data.variantCount,
      treeProps: data.treeProps,
    });
    return;
  }
}
</script>

{#if testing}
  <TestResults />
{:else if $optionsStore.screen == "AskForBlueprint"}
  <WaitingForBlueprint />
{:else if $optionsStore.screen == "ReadyToGenerate"}
  <GenerateVariant />
{:else if $optionsStore.screen == "RequestAccess"}
  <RequestAccess />
{:else}
  <h1>No Screen found</h1>
{/if}
