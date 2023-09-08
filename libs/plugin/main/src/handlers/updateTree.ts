import { Command, Event, MessageBus, type MessageData } from '@cva/shared';

import { VarianceTree } from '@code/metadata';

export function updateTree(data: MessageData<Command.UpdateTree>): void {
  const tree = new VarianceTree(data.blueprint);

  MessageBus.publishEvent(Event.TreeUpdated, {
    mutationTree: tree.asRulesTree(),
  });
}

export default updateTree;
