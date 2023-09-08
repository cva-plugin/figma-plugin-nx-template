import { type FigmaNode } from '@shared/types';

import { GenerationRule } from '@code/types/GenerationRule';

export class EffectRule extends GenerationRule {
  constructor(public override readonly blueprint: FigmaNode) {
    super(blueprint);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(variant: FrameNode, value: string | boolean): void {
    throw new Error('Method not implemented.');
  }
}
