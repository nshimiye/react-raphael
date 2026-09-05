import type { RaphaelAnimation, RaphaelElement, RaphaelPaper, RaphaelSet } from 'raphael';
import Raphael from 'raphael';
import type {
  Animation,
  Attributes,
  CommonProps,
  PaperProps,
  ShapeProps,
  ShapeType,
} from './types.js';

type Props = Omit<ShapeProps, 'load' | 'update'>;
type SharedProps = Omit<CommonProps, 'load' | 'update'>;
export type ManagedPaper = RaphaelPaper & { id: string };
export type ManagedSet = RaphaelSet & { id: string; paper: ManagedPaper };
type Item = RaphaelElement | ManagedSet;
export interface ElementRecord {
  type: ShapeType | 'set';
  element: Item;
  paper: ManagedPaper;
  parent: ManagedPaper | ManagedSet;
  props: Props;
}
const events = [
  'click',
  'dblclick',
  'mousedown',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
] as const;
const glows = new WeakMap<RaphaelElement, RaphaelSet>();
const paperProps = new WeakMap<RaphaelPaper, PaperProps>();
const geometryKeys = new Set([
  'x',
  'y',
  'r',
  'rx',
  'ry',
  'width',
  'height',
  'src',
  'd',
  'text',
  'fontFamily',
  'fontWeight',
  'fontStyle',
  'fontStretch',
  'fontSize',
  'origin',
  'letterSpacing',
  'lineSpacing',
  'x1',
  'y1',
  'x2',
  'y2',
]);
let nextId = 0;

/** Compare value props, but retain identity semantics for Raphaël instances. */
export function equal(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (!Array.isArray(a) && Object.getPrototypeOf(a) !== Object.prototype) return false;
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  return (
    Object.keys(left).length === Object.keys(right).length &&
    Object.keys(left).every((key) => Object.hasOwn(right, key) && equal(left[key], right[key]))
  );
}

export function lineAttributes(attrs: Attributes, props: ShapeProps): Attributes {
  const {
    x1 = props.x1 ?? 0,
    y1 = props.y1 ?? 0,
    x2 = props.x2 ?? 0,
    y2 = props.y2 ?? 0,
    ...rest
  } = attrs;
  return { ...rest, path: `M${x1},${y1}L${x2},${y2}` };
}

export function animationFor(input: Animation, line?: ShapeProps): RaphaelAnimation {
  if ('attrs' in input) {
    let animation = Raphael.animation(
      line ? lineAttributes(input.attrs, line) : input.attrs,
      input.duration,
      input.easing,
      input.callback,
    );
    if (input.repeat !== undefined) animation = animation.repeat(input.repeat);
    if (input.delay !== undefined) animation = animation.delay(input.delay);
    return animation;
  }
  if (!line) return input;
  // Raphaël's public types omit its keyframe storage. Clone it without modifying the caller's animation.
  const source = input as RaphaelAnimation & { anim: Record<string, Attributes> };
  const anim = Object.fromEntries(
    Object.entries(source.anim).map(([key, attrs]) => [key, lineAttributes(attrs, line)]),
  );
  return Object.assign(Object.create(Object.getPrototypeOf(input)), input, {
    anim,
  }) as RaphaelAnimation;
}

function geometry(type: ShapeType, p: Props): Attributes {
  const { x = 0, y = 0 } = p;
  switch (type) {
    case 'circle':
      return { cx: x, cy: y, r: p.r ?? 10 };
    case 'ellipse':
      return { cx: x, cy: y, rx: p.rx ?? 10, ry: p.ry ?? 20 };
    case 'rect':
      return { x, y, width: p.width ?? 0, height: p.height ?? 0, r: p.r ?? 0 };
    case 'image':
      return { x, y, width: p.width ?? 0, height: p.height ?? 0, src: p.src ?? '' };
    case 'text':
      return { x, y, text: p.text ?? '' };
    case 'path':
      return { path: pathString(p.d) };
    case 'line':
      return lineAttributes({}, p);
    case 'print':
      return {};
  }
}

function pathString(d: Props['d']): string {
  return typeof d === 'string' ? d || 'M0,0L0,0Z' : d?.flat().join(' ') || 'M0,0L0,0Z';
}
function printShape(paper: RaphaelPaper, p: Props): RaphaelElement {
  const family = p.fontFamily ?? 'Arial';
  const font = paper.getFont(family, p.fontWeight, p.fontStyle, p.fontStretch);
  if (!font)
    throw new Error(
      `react-raphael: register vector font "${family}" with Raphael.registerFont before using Print.`,
    );
  // @types/raphael still describes the pre-2.3 return type/signature for print.
  const print = paper.print as unknown as (...args: unknown[]) => RaphaelElement;
  return print.call(
    paper,
    p.x ?? 0,
    p.y ?? 0,
    p.text ?? '',
    font,
    p.fontSize ?? 16,
    p.origin ?? 'middle',
    p.letterSpacing ?? 0,
    p.lineSpacing ?? 1,
  );
}

function attrDiff(next: Attributes = {}, previous: Attributes = {}): Attributes {
  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => !equal(value, previous[key as keyof Attributes])),
  ) as Attributes;
}
// Raphaël has symmetrical event methods, but their generic overloads cannot be indexed uniformly.
function eventMethod(el: RaphaelElement, method: string, ...args: unknown[]): void {
  const fn = (el as unknown as Record<string, (...args: unknown[]) => unknown>)[method];
  fn.apply(el, args);
}
function shared(el: RaphaelElement, next: SharedProps, prev: SharedProps = {}, line?: Props): void {
  if ((el as RaphaelElement & { removed?: boolean }).removed) return;
  const attrs = attrDiff(next.attr, prev.attr);
  if (Object.keys(attrs).length)
    el.attr(
      line && ['x1', 'y1', 'x2', 'y2'].some((key) => key in attrs)
        ? lineAttributes(next.attr ?? {}, line)
        : attrs,
    );
  for (const event of events) {
    if (next[event] === prev[event]) continue;
    if (prev[event]) eventMethod(el, `un${event}`, prev[event]);
    if (next[event]) eventMethod(el, event, next[event]);
  }
  if (!equal(next.hover, prev.hover)) {
    if (prev.hover) eventMethod(el, 'unhover', prev.hover.in, prev.hover.out);
    if (next.hover)
      eventMethod(
        el,
        'hover',
        next.hover.in,
        next.hover.out,
        next.hover.icontext,
        next.hover.ocontext,
      );
  }
  if (!equal(next.drag, prev.drag)) {
    if (prev.drag) el.undrag();
    if (next.drag)
      eventMethod(
        el,
        'drag',
        next.drag.move,
        next.drag.start,
        next.drag.end,
        next.drag.mcontext,
        next.drag.scontext,
        next.drag.econtext,
      );
  }
  for (const key of Object.keys(prev.data ?? {}))
    if (!Object.hasOwn(next.data ?? {}, key)) el.removeData(key);
  for (const [key, value] of Object.entries(next.data ?? {}))
    if (!equal(value, prev.data?.[key])) el.data(key, value);
  if (next.hide !== prev.hide) next.hide ? el.hide() : el.show();
  if (
    ['transform', 'translate', 'rotate', 'scale'].some(
      (key) => !equal(next[key as keyof SharedProps], prev[key as keyof SharedProps]),
    )
  ) {
    el.transform(
      Array.isArray(next.transform) ? next.transform.flat().join(',') : (next.transform ?? ''),
    );
    if (next.translate) el.translate(next.translate.x, next.translate.y);
    if (next.rotate) eventMethod(el, 'rotate', next.rotate.deg, next.rotate.cx, next.rotate.cy);
    if (next.scale)
      eventMethod(
        el,
        'scale',
        next.scale.sx,
        next.scale.sy ?? next.scale.sx,
        next.scale.cx,
        next.scale.cy,
      );
  }
  if (next.toBack && !prev.toBack) el.toBack();
  if (next.toFront && !prev.toFront) el.toFront();
  if (!equal(next.glow, prev.glow)) {
    glows.get(el)?.remove();
    glows.delete(el);
    if (next.glow)
      glows.set(
        el,
        el.glow({
          width: 10,
          fill: false,
          opacity: 0.5,
          offsetx: 0,
          offsety: 0,
          color: '#000',
          ...next.glow,
        }),
      );
  }
  if (!equal(next.animate, prev.animate)) {
    if (prev.animate) el.stop();
    if (next.animate) el.animate(animationFor(next.animate, line));
  }
  if (!equal(next.animateWith, prev.animateWith)) {
    if (prev.animateWith) el.stop();
    if (next.animateWith) {
      const sync = next.animateWith;
      el.animateWith(sync.element, sync.animation, animationFor(sync.with ?? sync.animation, line));
    }
  }
  if (
    next.stop &&
    (!prev.stop || next.animate !== prev.animate || next.animateWith !== prev.animateWith)
  )
    el.stop();
}

function leaves(item: Item): RaphaelElement[] {
  const record = Utils.elements.find((entry) => entry.element === item);
  return record?.type === 'set'
    ? Utils.elements
        .filter((entry) => entry.parent === item)
        .flatMap((entry) => leaves(entry.element))
    : [item as RaphaelElement];
}

export const Utils = {
  papers: [] as ManagedPaper[],
  elements: [] as ElementRecord[],
  createPaper(container: HTMLElement, props: PaperProps): ManagedPaper {
    const paper = Raphael(container, props.width ?? 100, props.height ?? 100) as ManagedPaper;
    paper.id = container.id || `paper-${++nextId}`;
    Utils.papers.push(paper);
    Utils.updatePaper(paper, props);
    return paper;
  },
  updatePaper(paper: RaphaelPaper, props: PaperProps): void {
    const prev = paperProps.get(paper);
    if (props.width !== prev?.width || props.height !== prev?.height)
      paper.setSize(props.width ?? 100, props.height ?? 100);
    if (props.viewbox !== prev?.viewbox) {
      if (props.viewbox) {
        const box = props.viewbox
          .trim()
          .split(/[\s,]+/)
          .map(Number);
        if (box.length !== 4 || box.some((n) => !Number.isFinite(n)) || box[2] <= 0 || box[3] <= 0)
          throw new Error(
            'react-raphael: viewbox must contain x y width height, with positive dimensions.',
          );
        paper.setViewBox(box[0], box[1], box[2], box[3], true);
      } else if (prev?.viewbox) {
        // Raphaël uses null to restore the viewport and rescale strokes.
        (paper.setViewBox as unknown as (x: null) => void)(null);
      }
    }
    paperProps.set(paper, { ...props });
  },
  findParentById(id: string): {
    parent: ManagedPaper | ManagedSet | null;
    paper: ManagedPaper | null;
  } {
    const paper = Utils.papers.find((item) => item.id === id);
    if (paper) return { paper, parent: paper };
    const set = Utils.elements.find((item) => item.type === 'set' && item.element.id === id);
    return set
      ? { paper: set.paper, parent: set.element as ManagedSet }
      : { paper: null, parent: null };
  },
  create(parentId: string, type: ShapeType | 'set', props: Props): Item {
    const { parent, paper } = Utils.findParentById(parentId);
    if (!parent || !paper)
      throw new Error('react-raphael: shapes and sets must be descendants of a mounted Paper.');
    let element: Item;
    switch (type) {
      case 'set':
        element = Object.assign(paper.set(), { id: `set-${++nextId}`, paper });
        break;
      case 'circle':
        element = paper.circle(0, 0, 10);
        break;
      case 'ellipse':
        element = paper.ellipse(0, 0, 10, 20);
        break;
      case 'rect':
        element = paper.rect(0, 0, 0, 0);
        break;
      case 'image':
        element = paper.image(props.src ?? '', 0, 0, 0, 0);
        break;
      case 'text':
        element = paper.text(0, 0, '');
        break;
      case 'path':
      case 'line':
        element = paper.path();
        break;
      case 'print':
        element = printShape(paper, props);
        break;
      default:
        throw new Error(`react-raphael: unsupported shape ${type}.`);
    }
    if (parent !== paper) (parent as ManagedSet).push(element as RaphaelElement);
    const record: ElementRecord = { type, element, paper, parent, props };
    Utils.elements.push(record);
    if (type !== 'set') {
      const el = element as RaphaelElement;
      el.attr(geometry(type, props));
      const ancestors: ElementRecord[] = [];
      let ancestor = Utils.elements.find((entry) => entry.element === parent);
      while (ancestor) {
        ancestors.unshift(ancestor);
        ancestor = Utils.elements.find((entry) => entry.element === ancestor?.parent);
      }
      for (const entry of ancestors) shared(el, entry.props);
      shared(el, props, {}, type === 'line' ? props : undefined);
    }
    return element;
  },
  createElement(
    parentId: string,
    type: ShapeType,
    props: Props,
    callback?: (element: RaphaelElement) => void,
  ): RaphaelElement {
    const element = Utils.create(parentId, type, props) as RaphaelElement;
    callback?.(element);
    return element;
  },
  createSet(
    parentId: string,
    props: SharedProps,
    callback?: (set: ManagedSet) => void,
  ): ManagedSet {
    const set = Utils.create(parentId, 'set', props) as ManagedSet;
    callback?.(set);
    return set;
  },
  updateElementProps(element: Item, props: SharedProps): void {
    const record = Utils.elements.find((entry) => entry.element === element);
    for (const leaf of leaves(element))
      shared(leaf, props, record?.props, record?.type === 'line' ? record.props : undefined);
    if (record)
      record.props = {
        ...Object.fromEntries(
          Object.entries(record.props).filter(([key]) => geometryKeys.has(key)),
        ),
        ...props,
      };
  },
  updateElement<T extends Item>(
    element: T,
    type: ShapeType | 'set',
    props: Props,
    callback?: (element: T) => void,
  ): T {
    const record = Utils.elements.find((entry) => entry.element === element);
    if (!record) return element;
    if (type !== 'set') {
      const el = element as RaphaelElement;
      if (type === 'print') {
        const keys = [
          'x',
          'y',
          'text',
          'fontFamily',
          'fontSize',
          'fontWeight',
          'fontStyle',
          'fontStretch',
          'origin',
          'letterSpacing',
          'lineSpacing',
        ] as const;
        if (keys.some((key) => !equal(props[key], record.props[key]))) {
          const printed = printShape(record.paper, props);
          el.attr({ path: printed.attr('path') });
          printed.remove();
        }
      } else el.attr(attrDiff(geometry(type, props), geometry(type, record.props)));
    }
    for (const leaf of leaves(element))
      shared(leaf, props, record.props, type === 'line' ? props : undefined);
    record.props = props;
    callback?.(element);
    return element;
  },
  removeElement(element: Item): void {
    const record = Utils.elements.find((entry) => entry.element === element);
    if (!record) return;
    if (record.type === 'set') {
      for (const child of Utils.elements.filter((entry) => entry.parent === element))
        Utils.removeElement(child.element);
      (element as ManagedSet).clear();
    } else {
      const el = element as RaphaelElement;
      glows.get(el)?.remove();
      if (!(el as RaphaelElement & { removed?: boolean }).removed) {
        el.stop();
        el.undrag();
        el.remove();
      }
      glows.delete(el);
    }
    if (record.parent !== record.paper)
      (record.parent as ManagedSet).exclude(element as RaphaelElement);
    Utils.elements.splice(Utils.elements.indexOf(record), 1);
  },
  removeSet(set: ManagedSet): void {
    Utils.removeElement(set);
  },
  removePaper(paper: RaphaelPaper): void {
    const index = Utils.papers.indexOf(paper as ManagedPaper);
    if (index === -1) return;
    for (const entry of Utils.elements.filter((entry) => entry.paper === paper))
      Utils.removeElement(entry.element);
    paper.remove();
    Utils.papers.splice(index, 1);
    paperProps.delete(paper);
  },
};
