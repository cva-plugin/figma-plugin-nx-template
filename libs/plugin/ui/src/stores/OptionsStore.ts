import { writable } from 'svelte/store';

export interface Options {
  figmaUserId: string;
  inviteCode: string | undefined;
  selectedFrame: string;
  documentationMode: boolean;
  screen: string;
}

function OptionsStore() {
  const { subscribe, set, update } = writable<Options>({
    figmaUserId: '',
    inviteCode: '',
    selectedFrame: '',
    documentationMode: false,
    screen: '',
  });

  return {
    subscribe,
    set,
    update,
  };
}

export const optionsStore = OptionsStore();
