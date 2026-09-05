import { afterEach, describe, expect, it, vi } from 'vitest';
import { Raphael } from '../src/index.js';
import type { RaphaelElement, ShapeProps } from '../src/types.js';
import { animationFor, equal, lineAttributes, Utils } from '../src/utils.js';

afterEach(() => {
  for (const paper of [...Utils.papers]) Utils.removePaper(paper);
});

describe('line animations', () => {
  it('preserves zero endpoints without changing frozen attributes', () => {
    const attrs = Object.freeze({ x1: 0, y2: 0, stroke: 'red' });
    expect(lineAttributes(attrs, { x1: 10, y1: 20, x2: 30, y2: 40 })).toEqual({
      path: 'M0,20L30,0',
      stroke: 'red',
    });
    expect(attrs).toEqual({ x1: 0, y2: 0, stroke: 'red' });
  });
  it('clones native keyframes and preserves delay/repeat and callbacks', () => {
    const callback = vi.fn();
    const original = Raphael.animation({ 50: { x1: 0 }, 100: { x2: 0, callback } }, 1000)
      .delay(50)
      .repeat(3);
    const converted = animationFor(original, { x1: 50, x2: 100, y1: 10, y2: 20 });
    expect(converted).not.toBe(original);
    expect(converted).toMatchObject({
      ms: 1000,
      times: 3,
      del: 50,
      anim: { 50: { path: 'M0,10L100,20' }, 100: { path: 'M50,10L0,20', callback } },
    });
    expect(original).toMatchObject({ anim: { 50: { x1: 0 }, 100: { x2: 0 } } });
    expect((original as unknown as { anim: Record<string, unknown> }).anim[50]).not.toHaveProperty(
      'path',
    );
  });
  it('converts typed animation options', () => {
    expect(
      animationFor(
        { attrs: { x2: 0 }, duration: 600, repeat: 2, delay: 25 },
        { x1: 10, y1: 20, x2: 50, y2: 40 },
      ),
    ).toMatchObject({ ms: 600, times: 2, del: 25, anim: { 100: { path: 'M10,20L0,40' } } });
  });
});

describe('prop reconciliation', () => {
  function fixture(props: ShapeProps = {}) {
    const el = {
      attr: vi.fn(),
      animate: vi.fn(),
      stop: vi.fn(),
      unclick: vi.fn(),
      click: vi.fn(),
      unhover: vi.fn(),
      hover: vi.fn(),
      transform: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      data: vi.fn(),
      removeData: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
    } as unknown as RaphaelElement;
    const paper = {} as (typeof Utils.papers)[number];
    const record = { type: 'circle' as const, element: el, parent: paper, paper, props };
    Utils.elements.push(record);
    return { el, dispose: () => Utils.elements.splice(Utils.elements.indexOf(record), 1) };
  }
  it('does not restart unchanged animations or reset imperative attrs/data/transforms', () => {
    const props = {
      x: 20,
      attr: { fill: 'red' },
      data: { score: 1 },
      animate: { attrs: { cx: 100 }, duration: 1000 },
    };
    const { el, dispose } = fixture(props);
    Utils.updateElement(el, 'circle', { ...props, attr: { fill: 'red' }, data: { score: 1 } });
    expect(el.animate).not.toHaveBeenCalled();
    expect(el.stop).not.toHaveBeenCalled();
    expect(el.attr).toHaveBeenCalledWith({});
    expect(el.data).not.toHaveBeenCalled();
    expect(el.transform).not.toHaveBeenCalled();
    dispose();
  });
  it('unbinds replaced and removed handlers by their original function', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { el, dispose } = fixture({ click: first });
    Utils.updateElement(el, 'circle', { click: second });
    expect(el.unclick).toHaveBeenCalledWith(first);
    expect(el.click).toHaveBeenCalledWith(second);
    Utils.updateElement(el, 'circle', {});
    expect(el.unclick).toHaveBeenLastCalledWith(second);
    dispose();
  });
  it('accepts string transforms and clears removed transforms', () => {
    const { el, dispose } = fixture();
    Utils.updateElement(el, 'circle', { transform: 't10,20' });
    expect(el.transform).toHaveBeenLastCalledWith('t10,20');
    Utils.updateElement(el, 'circle', {});
    expect(el.transform).toHaveBeenLastCalledWith('');
    dispose();
  });
  it('low-level prop updates remember removals without losing geometry', () => {
    const click = vi.fn();
    const { el, dispose } = fixture({ x: 20, click });
    Utils.updateElementProps(el, {});
    Utils.updateElementProps(el, { click });
    expect(el.unclick).toHaveBeenCalledWith(click);
    expect(el.click).toHaveBeenCalledWith(click);
    expect(Utils.elements.find((entry) => entry.element === el)?.props.x).toBe(20);
    dispose();
  });
  it('compares plain values deeply but native animations by identity', () => {
    expect(equal({ a: [0, 'x'] }, { a: [0, 'x'] })).toBe(true);
    expect(equal(Raphael.animation({ cx: 2 }, 100), Raphael.animation({ cx: 2 }, 100))).toBe(false);
  });
});
