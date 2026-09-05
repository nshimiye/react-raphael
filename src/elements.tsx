import type { RaphaelElement } from 'raphael';
import {
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  CircleProps,
  ElementHandle,
  ElementProps,
  EllipseProps,
  ImageProps,
  LineProps,
  PaperHandle,
  PaperProps,
  PathProps,
  PrintProps,
  RectProps,
  SetHandle,
  SetProps,
  ShapeProps,
  ShapeType,
  TextProps,
} from './types.js';
import type { ManagedPaper, ManagedSet } from './utils.js';
import { Utils } from './utils.js';

interface ParentResource {
  current: { readonly current: ManagedPaper | ManagedSet | null };
  generation: ManagedPaper | ManagedSet | null;
}
const Parent = createContext<ParentResource | null>(null);

export const Paper = forwardRef<PaperHandle, PaperProps>(function Paper(props, ref) {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<ManagedPaper | null>(null);
  const [paper, setPaper] = useState<ManagedPaper | null>(null);
  const context = useMemo(() => ({ current: instance, generation: paper }), [paper]);
  useLayoutEffect(() => {
    if (!container.current) return;
    const created = Utils.createPaper(container.current, props);
    instance.current = created;
    setPaper(created);
    return () => {
      instance.current = null;
      Utils.removePaper(created);
    };
  }, []);
  useLayoutEffect(() => {
    if (instance.current) Utils.updatePaper(instance.current, props);
  });
  useImperativeHandle(ref, () => ({ getPaper: () => instance.current }), []);
  const { className = '', ...attributes } = props.container ?? {};
  return (
    <div className="react-raphael">
      <div {...attributes} ref={container} className={`paper-container ${className}`} />
      {paper && <Parent.Provider value={context}>{props.children}</Parent.Provider>}
    </div>
  );
});

export const Set = forwardRef<SetHandle, SetProps>(function Set(props, ref) {
  const parent = useContext(Parent);
  const instance = useRef<ManagedSet | null>(null);
  const [set, setSet] = useState<ManagedSet | null>(null);
  const context = useMemo(() => ({ current: instance, generation: set }), [set]);
  const previous = useRef<SetProps | null>(null);
  if (!parent) throw new Error('react-raphael: Set must be inside Paper.');
  useLayoutEffect(() => {
    // React 18 can replay a parent effect before committing its new context generation.
    // Read the live resource, not the instance captured by the preceding render.
    const owner = parent.current.current;
    if (!owner || !Utils.findParentById(owner.id).paper) return;
    const created = Utils.createSet(owner.id, props);
    instance.current = created;
    previous.current = props;
    setSet(created);
    props.load?.(created);
    return () => {
      instance.current = null;
      Utils.removeSet(created);
    };
  }, [parent]);
  useLayoutEffect(() => {
    if (instance.current && previous.current !== props) {
      Utils.updateElement(instance.current, 'set', props, props.update);
      previous.current = props;
    }
  });
  useImperativeHandle(ref, () => ({ getSet: () => instance.current }), []);
  return set && <Parent.Provider value={context}>{props.children}</Parent.Provider>;
});

export const Element = forwardRef<ElementHandle, ElementProps>(function Element(props, ref) {
  const parent = useContext(Parent);
  const instance = useRef<RaphaelElement | null>(null);
  const previous = useRef<ElementProps | null>(null);
  if (!parent) throw new Error('react-raphael: shapes must be inside Paper.');
  useLayoutEffect(() => {
    const owner = parent.current.current;
    if (!owner || !Utils.findParentById(owner.id).paper) return;
    const created = Utils.createElement(owner.id, props.type, props);
    instance.current = created;
    previous.current = props;
    props.load?.(created);
    return () => {
      instance.current = null;
      Utils.removeElement(created);
    };
  }, [parent, props.type]);
  useLayoutEffect(() => {
    if (instance.current && previous.current !== props) {
      Utils.updateElement(instance.current, props.type, props, props.update);
      previous.current = props;
    }
  });
  // Defined after creation so callback refs can call getElement() immediately.
  useImperativeHandle(ref, () => ({ getElement: () => instance.current }), []);
  return null;
});

function shape<P extends ShapeProps>(type: ShapeType, name: string) {
  const Component = forwardRef<ElementHandle, P>((props, ref) => (
    <Element {...props} type={type} ref={ref} />
  ));
  Component.displayName = name;
  return Component;
}
export const Circle = shape<CircleProps>('circle', 'Circle');
export const Ellipse = shape<EllipseProps>('ellipse', 'Ellipse');
export const Image = shape<ImageProps>('image', 'Image');
export const Path = shape<PathProps>('path', 'Path');
export const Rect = shape<RectProps>('rect', 'Rect');
export const Text = shape<TextProps>('text', 'Text');
export const Print = shape<PrintProps>('print', 'Print');
export const Line = shape<LineProps>('line', 'Line');
