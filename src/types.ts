import type {
  RaphaelAnimation,
  RaphaelAttributes,
  RaphaelBuiltinEasingFormula,
  RaphaelCustomEasingFormula,
  RaphaelDragOnEndHandler,
  RaphaelDragOnMoveHandler,
  RaphaelDragOnStartHandler,
  RaphaelElement,
  RaphaelGlowSettings,
  RaphaelPaper,
  RaphaelSet,
  RaphaelTransformSegment,
} from 'raphael';
import type { HTMLAttributes, ReactNode } from 'react';

export type { RaphaelAnimation, RaphaelElement, RaphaelPaper, RaphaelSet } from 'raphael';
export type Attributes = Partial<RaphaelAttributes> & {
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
};
export interface AnimationOptions {
  attrs: Attributes;
  duration: number;
  easing?: RaphaelBuiltinEasingFormula | RaphaelCustomEasingFormula;
  callback?: (this: RaphaelElement) => void;
  repeat?: number;
  delay?: number;
}
export type Animation = RaphaelAnimation | AnimationOptions;
export interface SynchronizedAnimation {
  element: RaphaelElement;
  animation: RaphaelAnimation;
  /** Defaults to the leader's animation. */
  with?: Animation;
}
export type ShapeEventHandler = (
  this: RaphaelElement,
  event: MouseEvent | TouchEvent,
  x: number,
  y: number,
) => void;
export interface CommonProps<T = RaphaelElement> {
  attr?: Attributes;
  animate?: Animation;
  animateWith?: SynchronizedAnimation;
  data?: Record<string, unknown>;
  click?: ShapeEventHandler;
  dblclick?: ShapeEventHandler;
  mousedown?: ShapeEventHandler;
  mousemove?: ShapeEventHandler;
  mouseout?: ShapeEventHandler;
  mouseover?: ShapeEventHandler;
  mouseup?: ShapeEventHandler;
  touchcancel?: ShapeEventHandler;
  touchend?: ShapeEventHandler;
  touchmove?: ShapeEventHandler;
  touchstart?: ShapeEventHandler;
  hover?: { in: ShapeEventHandler; out: ShapeEventHandler; icontext?: unknown; ocontext?: unknown };
  drag?: {
    move: RaphaelDragOnMoveHandler<RaphaelElement>;
    start?: RaphaelDragOnStartHandler<RaphaelElement>;
    end?: RaphaelDragOnEndHandler<RaphaelElement>;
    mcontext?: unknown;
    scontext?: unknown;
    econtext?: unknown;
  };
  glow?: Partial<RaphaelGlowSettings>;
  hide?: boolean;
  stop?: boolean;
  toBack?: boolean;
  toFront?: boolean;
  transform?: string | RaphaelTransformSegment[];
  translate?: { x: number; y: number };
  rotate?: { deg: number; cx?: number; cy?: number };
  scale?: { sx: number; sy?: number; cx?: number; cy?: number };
  load?: (element: T) => void;
  update?: (element: T) => void;
}
export interface PaperProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  viewbox?: string;
  container?: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'dangerouslySetInnerHTML'>;
  children?: ReactNode;
}
export interface PaperHandle {
  getPaper(): RaphaelPaper | null;
}
export interface ElementHandle {
  getElement(): RaphaelElement | null;
}
export interface SetHandle {
  getSet(): RaphaelSet | null;
}
export interface SetProps extends CommonProps<RaphaelSet> {
  children?: ReactNode;
}
export interface CircleProps extends CommonProps {
  x?: number;
  y?: number;
  r?: number;
}
export interface EllipseProps extends CommonProps {
  x?: number;
  y?: number;
  rx?: number;
  ry?: number;
}
export interface ImageProps extends CommonProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  src?: string;
}
export type PathData = string | ReadonlyArray<string | number | ReadonlyArray<string | number>>;
export interface PathProps extends CommonProps {
  d?: PathData;
}
export interface RectProps extends CommonProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  r?: number;
}
export interface TextProps extends CommonProps {
  x?: number;
  y?: number;
  text?: string;
}
export interface PrintProps extends TextProps {
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: string;
  fontStretch?: string;
  fontSize?: number;
  origin?: 'baseline' | 'middle';
  letterSpacing?: number;
  lineSpacing?: number;
}
export interface LineProps extends CommonProps {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}
export type ShapeType =
  | 'circle'
  | 'ellipse'
  | 'image'
  | 'path'
  | 'rect'
  | 'text'
  | 'print'
  | 'line';
/** Also used by the low-level Utils API. */
export interface ShapeProps
  extends CircleProps,
    EllipseProps,
    ImageProps,
    PathProps,
    RectProps,
    PrintProps,
    LineProps {}
export interface ElementProps extends ShapeProps {
  type: ShapeType;
}
