import type { RaphaelAnimation, RaphaelFont, RaphaelStatic } from 'raphael';
import Runtime from 'raphael';
import type { AnimationOptions, Attributes } from './types.js';

export type AnimationKeyframes = Record<
  number,
  Attributes & { easing?: AnimationOptions['easing']; callback?: () => void }
>;
// Correct omissions in @types/raphael while preserving the actual runtime singleton.
export const Raphael = Runtime as RaphaelStatic & {
  animation(
    params: Attributes | AnimationKeyframes,
    duration: number,
    easing?: AnimationOptions['easing'],
    callback?: () => void,
  ): RaphaelAnimation;
  registerFont(font: RaphaelFont & { svg?: boolean }): RaphaelFont;
};
