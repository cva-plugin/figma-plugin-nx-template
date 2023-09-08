import { MutationKind } from '@shared/types';
import { EffectRule } from '@code/generation/rules';
import { Header } from '@code/types';

export class EffectHeader extends Header {
  constructor(
    effectRule: EffectRule,
    title: string,
    public readonly effect: Effect
  ) {
    super(effectRule, title, MutationKind.Effect, []);

    throw new Error('Not implemented');
  }
}
