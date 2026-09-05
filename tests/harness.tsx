import type { ReactNode } from 'react';
import { createRef, StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { ElementHandle, PaperHandle, SetHandle } from '../src/index.js';
import {
  Circle,
  Element,
  Ellipse,
  Image,
  Line,
  Paper,
  Path,
  Print,
  Raphael,
  Rect,
  Set,
  Text,
  Utils,
} from '../src/index.js';
import '../demo/font.js';

const node = document.getElementById('root');
if (!node) throw new Error('Missing test root');
const root = createRoot(node);
const circle = createRef<ElementHandle>();
const paper = createRef<PaperHandle>();
const set = createRef<SetHandle>();
const nativeAnimation = Raphael.animation({ cx: 180 }, 2000);
let clicks = 0;
let callbacks = 0;
let immediateRef = false;
let revision = 0;
function render(children: ReactNode) {
  flushSync(() => root.render(<StrictMode>{children}</StrictMode>));
}
function scene(count = 1, enabled = true, viewbox = '0 0 400 200') {
  revision++;
  render(
    <>
      <Paper ref={paper} width={400} height={200} viewbox={viewbox}>
        <Set ref={set} attr={{ fill: enabled ? '#ff0000' : '#00ff00' }}>
          <Set>
            {['first', 'second', 'third'].slice(0, count).map((id, i) => (
              <Circle
                key={id}
                x={20 + i * 30}
                y={30}
                r={10}
                ref={i === 0 ? circle : undefined}
                data={{ score: 1 }}
                click={
                  enabled
                    ? () => {
                        clicks += revision;
                      }
                    : undefined
                }
              />
            ))}
          </Set>
        </Set>
        <Rect
          x={5}
          y={80}
          width={25}
          height={20}
          ref={(handle) => {
            if (handle) immediateRef = !!handle.getElement();
          }}
        />
        <Text x={80} y={100} text="Hello" />
      </Paper>
      <Paper width={100} height={100}>
        <Circle x={25} y={25} />
      </Paper>
    </>,
  );
}

const api = {
  scene,
  clear: () => render(null),
  state: () => ({
    papers: Utils.papers.length,
    elements: Utils.elements.length,
    clicks,
    callbacks,
    immediateRef,
    setLength: set.current?.getSet()?.length,
    circle: {
      cx: circle.current?.getElement()?.attr('cx'),
      fill: circle.current?.getElement()?.attr('fill'),
    },
    data: circle.current?.getElement()?.data('score'),
  }),
  imperative: () => {
    circle.current?.getElement()?.attr({ cx: 91, fill: '#0000ff' });
    circle.current?.getElement()?.data('score', 99);
  },
  animated: (changed = false) =>
    render(
      <Paper width={400} height={100}>
        <Circle
          ref={circle}
          x={20}
          y={50}
          r={10}
          animate={nativeAnimation}
          data={{ note: changed }}
          update={() => callbacks++}
        />
      </Paper>,
    ),
  allShapes: () =>
    render(
      <Paper width={400} height={200}>
        <Ellipse x={20} y={20} />
        <Image src="/mark.svg" width={20} height={20} />
        <Path d={['M', 0, 0, 'L', 20, 20]} />
        <Line x1={0} x2={30} />
        <Print x={10} y={100} text="VECTOR" fontFamily="Playground Pixel" />
        <Element type="rect" x={100} width={20} height={20} />
      </Paper>,
    ),
  print: (text: string) =>
    render(
      <Paper width={400} height={100}>
        <Print x={10} y={40} text={text} fontFamily="Playground Pixel" />
      </Paper>,
    ),
  glow: (enabled: boolean) =>
    render(
      <Paper width={100} height={100}>
        <Circle x={50} y={50} r={20} glow={enabled ? { width: 8 } : undefined} />
      </Paper>,
    ),
  line: () =>
    render(
      <Paper width={200} height={100}>
        <Line
          x1={40}
          y1={30}
          x2={150}
          y2={60}
          animate={{ attrs: { x1: 0, x2: 0 }, duration: 80 }}
        />
      </Paper>,
    ),
};
declare global {
  interface Window {
    harness: typeof api;
  }
}
window.harness = api;
