import { writable } from 'svelte/store';

import type { IRulesTreeNode, ReadyToGenerateEvent } from '@cva/shared';

function GenerationStore() {
  const getNodeByPath = (
    tree: IRulesTreeNode,
    path: string[] | string
  ): IRulesTreeNode | null => {
    if (!Array.isArray(path)) {
      path = path.split('.');
    }
    if (path.length === 1 && path[0] === tree.name) {
      return tree;
    }

    const next = tree.children.find((child) => child.name === path[0]);

    if (next === undefined) {
      return null;
    }

    if (path.length === 1 && next.name === path[0]) {
      return next;
    }

    if ('children' in next) {
      return getNodeByPath(next, path.slice(1));
    }

    return null;
  };

  const { subscribe, set, update } = writable<ReadyToGenerateEvent>();

  return {
    subscribe,
    set,
    update,
    getNodeByPath,
  };
}

export const generationStore = GenerationStore();
