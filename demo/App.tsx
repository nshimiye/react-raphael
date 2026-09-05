import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Attributes, RaphaelElement } from '../src/index.js';
import {
  Circle,
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
} from '../src/index.js';

const purple = '#8061d9';
const orange = '#e89458';
const green = '#69a894';
const blue = '#629bc4';
const base = { stroke: 'none' };

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  return (
    <details className="code">
      <summary>
        View code <span aria-hidden="true">↗</span>
      </summary>
      <div className="code-body">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(children);
              setCopied(true);
              setError(false);
            } catch {
              setError(true);
            }
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        {error && <p role="status">Copy unavailable. Select the code below to copy it.</p>}
        <pre>
          <code>{children}</code>
        </pre>
      </div>
    </details>
  );
}

const shapes: {
  name: string;
  description: string;
  color: string;
  code: string;
  node: ReactNode;
}[] = [
  {
    name: 'Circle',
    description: 'A perfectly simple starting point.',
    color: purple,
    code: '<Circle x={150} y={80} r={46}\n  attr={{ fill: "#8061d9", stroke: "none" }} />',
    node: (
      <>
        <Circle x={124} y={80} r={47} attr={{ ...base, fill: '#e0d6f7' }} />
        <Circle x={174} y={80} r={47} attr={{ ...base, fill: purple, opacity: 0.9 }} />
      </>
    ),
  },
  {
    name: 'Ellipse',
    description: 'Give your circles a little perspective.',
    color: green,
    code: '<Ellipse x={150} y={80} rx={78} ry={38}\n  attr={{ fill: "#69a894", stroke: "none" }} />',
    node: (
      <>
        <Ellipse x={150} y={95} rx={78} ry={35} attr={{ ...base, fill: '#dcece5' }} />
        <Ellipse x={150} y={74} rx={78} ry={35} attr={{ ...base, fill: green }} />
      </>
    ),
  },
  {
    name: 'Rect',
    description: 'Sharp corners. Soft edges. Your call.',
    color: orange,
    code: '<Rect x={88} y={38} width={124} height={84} r={18}\n  attr={{ fill: "#e89458", stroke: "none" }} />',
    node: (
      <>
        <Rect x={76} y={43} width={108} height={83} r={4} attr={{ ...base, fill: '#f5dfcb' }} />
        <Rect x={120} y={31} width={108} height={83} r={22} attr={{ ...base, fill: orange }} />
      </>
    ),
  },
  {
    name: 'Path',
    description: 'Every curve begins with a point.',
    color: blue,
    code: '<Path d="M60,110C90,0,120,150,150,60S220,30,240,100"\n  attr={{ stroke: "#629bc4", "stroke-width": 5, "stroke-linecap": "round" }} />',
    node: (
      <>
        <Path
          d="M60,110C90,0,120,150,150,60S220,30,240,100"
          attr={{ stroke: blue, 'stroke-width': 5, 'stroke-linecap': 'round' }}
        />
        <Circle x={60} y={110} r={6} attr={{ ...base, fill: blue }} />
        <Circle x={240} y={100} r={6} attr={{ ...base, fill: blue }} />
      </>
    ),
  },
  {
    name: 'Line',
    description: 'Connect the dots, in any direction.',
    color: orange,
    code: '<Line x1={75} y1={112} x2={225} y2={48}\n  attr={{ stroke: "#e89458", "stroke-width": 4 }} />',
    node: (
      <>
        <Line
          x1={75}
          y1={112}
          x2={225}
          y2={48}
          attr={{ stroke: orange, 'stroke-width': 4, 'stroke-linecap': 'round' }}
        />
        <Circle
          x={75}
          y={112}
          r={7}
          attr={{ fill: '#faf9f6', stroke: orange, 'stroke-width': 3 }}
        />
        <Circle
          x={225}
          y={48}
          r={7}
          attr={{ fill: '#faf9f6', stroke: orange, 'stroke-width': 3 }}
        />
      </>
    ),
  },
  {
    name: 'Text',
    description: 'Words belong on the canvas, too.',
    color: purple,
    code: '<Text x={150} y={80} text="Hello, vectors."\n  attr={{ fill: "#8061d9", "font-size": 27, "font-family": "Georgia" }} />',
    node: (
      <Text
        x={150}
        y={80}
        text="Hello, vectors."
        attr={{ fill: purple, 'font-size': 29, 'font-family': 'Georgia' }}
      />
    ),
  },
  {
    name: 'Image',
    description: 'A familiar face in a vector world.',
    color: purple,
    code: '<Image src="./mark.svg" x={110} y={40}\n  width={80} height={80} />',
    node: <Image src="./mark.svg" x={110} y={40} width={80} height={80} />,
  },
  {
    name: 'Print',
    description: 'Turn a registered font into paths.',
    color: green,
    code: '// Register a vector font first (see demo/font.ts).\n<Print x={47} y={80} text="VECTOR"\n  fontFamily="Playground Pixel" fontSize={40}\n  attr={{ fill: "#69a894" }} />',
    node: (
      <Print
        x={47}
        y={80}
        text="VECTOR"
        fontFamily="Playground Pixel"
        fontSize={40}
        attr={{ fill: green }}
      />
    ),
  },
  {
    name: 'Set',
    description: 'Good things work better together.',
    color: blue,
    code: '<Set attr={{ stroke: "none" }} transform="r-12,150,80">\n  <Rect x={82} y={52} width={56} height={56} r={10}\n    attr={{ fill: "#629bc4" }} />\n  <Set><Circle x={177} y={80} r={34}\n    attr={{ fill: "#b4d2e5" }} /></Set>\n</Set>',
    node: (
      <Set attr={{ stroke: 'none' }} transform="r-12,150,80">
        <Rect x={82} y={52} width={56} height={56} r={10} attr={{ fill: blue }} />
        <Set>
          <Circle x={177} y={80} r={34} attr={{ fill: '#b4d2e5' }} />
        </Set>
      </Set>
    ),
  },
];

function AnimationLab() {
  const [duration, setDuration] = useState(2200);
  const [easing, setEasing] = useState('easeInOut');
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [revision, setRevision] = useState(0);
  const [ready, setReady] = useState(0);
  const elements = useRef<Record<string, RaphaelElement>>({});
  const playingRef = useRef(playing);
  playingRef.current = playing;
  function loaded(name: string, element: RaphaelElement) {
    elements.current[name] = element;
    setReady((value) => value + 1);
  }
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => {
      if (media.matches) setPlaying(false);
    };
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    const { motion, transform, morph, leader, follower } = elements.current;
    if (!motion || !transform || !morph || !leader || !follower) return;
    const start: Record<string, Attributes> = {
      motion: { cx: 125, fill: purple },
      transform: { transform: '' },
      morph: { path: 'M90,213C135,173,185,253,230,213' },
      leader: { cx: 125 },
      follower: { cx: 160 },
    };
    for (const [name, el] of Object.entries(elements.current)) {
      el.stop();
      el.attr(start[name]);
    }
    const loop = (middle: Attributes, end: Attributes) =>
      Raphael.animation({ 50: { ...middle, easing }, 100: { ...end, easing } }, duration).repeat(
        Infinity,
      );
    motion.animate(loop({ cx: 510, fill: '#bc91e5' }, start.motion));
    transform.animate(loop({ transform: 't370,0r180s0.7' }, start.transform));
    morph.animate(loop({ path: 'M390,213C435,293,485,133,530,213' }, start.morph));
    const sync = loop({ cx: 475 }, start.leader);
    leader.animate(sync);
    follower.animateWith(leader, sync, loop({ cx: 510 }, start.follower));
    if (!playingRef.current) for (const el of Object.values(elements.current)) el.pause();
    return () => {
      for (const el of Object.values(elements.current)) el.stop();
    };
  }, [ready, duration, easing, revision]);
  useEffect(() => {
    for (const el of Object.values(elements.current)) playing ? el.resume() : el.pause();
  }, [playing]);
  return (
    <section id="animation" className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">02 / IN MOTION</p>
          <h2>A little movement. A lot of possibility.</h2>
        </div>
        <span className="tag">
          <span className={`status-dot ${playing ? 'active' : ''}`} />
          {playing ? 'Playing' : 'Paused'}
        </span>
      </div>
      <div className="lab">
        <div className="animation-stage" data-testid="animation-stage">
          <div className="lane-labels">
            <span>Position + color</span>
            <span>Transform</span>
            <span>Path morph</span>
            <span>In sync</span>
          </div>
          <Paper
            width={650}
            height={350}
            viewbox="0 0 650 350"
            container={{ 'aria-label': 'Animated vector examples', role: 'img' }}
          >
            {[65, 139, 213, 287].map((y) => (
              <Line
                key={y}
                x1={80}
                y1={y}
                x2={560}
                y2={y}
                attr={{ stroke: '#e4e0da', 'stroke-dasharray': '.' }}
              />
            ))}
            <Circle
              x={125}
              y={65}
              r={19}
              attr={{ ...base, fill: purple }}
              load={(el) => loaded('motion', el)}
            />
            <Rect
              x={105}
              y={119}
              width={40}
              height={40}
              r={9}
              attr={{ ...base, fill: orange }}
              load={(el) => loaded('transform', el)}
            />
            <Path
              d="M90,213C135,173,185,253,230,213"
              attr={{ stroke: blue, 'stroke-width': 5, 'stroke-linecap': 'round' }}
              load={(el) => loaded('morph', el)}
            />
            <Circle
              x={125}
              y={287}
              r={18}
              attr={{ ...base, fill: green }}
              load={(el) => loaded('leader', el)}
            />
            <Circle
              x={160}
              y={287}
              r={11}
              attr={{ ...base, fill: '#aad2c2' }}
              load={(el) => loaded('follower', el)}
            />
          </Paper>
        </div>
        <aside className="controls">
          <h3>Make it your own</h3>
          <p>A few small adjustments can change the whole feeling.</p>
          <label htmlFor="duration">
            Duration <output>{(duration / 1000).toFixed(1)}s</output>
          </label>
          <input
            id="duration"
            type="range"
            min="800"
            max="5000"
            step="100"
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          />
          <label htmlFor="easing">Easing</label>
          <select id="easing" value={easing} onChange={(event) => setEasing(event.target.value)}>
            <option value="easeInOut">Ease in & out</option>
            <option value="linear">Linear</option>
            <option value="bounce">Bounce</option>
            <option value="elastic">Elastic</option>
            <option value="backOut">Back out</option>
          </select>
          <div className="button-row">
            <button className="primary" type="button" onClick={() => setPlaying((value) => !value)}>
              {playing ? 'Ⅱ Pause' : '▷ Play'}
            </button>
            <button type="button" onClick={() => setRevision((value) => value + 1)}>
              ↻ Replay
            </button>
          </div>
          <p className="hint">Animations run on Raphaël’s clock. React stays in control.</p>
        </aside>
      </div>
      <Code>
        {
          '<Circle x={40} y={50} r={20}\n  attr={{ fill: "#8061d9" }}\n  animate={{ attrs: { cx: 240 }, duration: 1200, easing: "<>" }} />\n\n// Native animations and synchronization are supported too:\nconst animation = Raphael.animation({ cx: 240 }, 1200, "<>");\nleader.animate(animation);\nfollower.animateWith(leader, animation, animation);'
        }
      </Code>
    </section>
  );
}

function Interactions() {
  const [clicks, setClicks] = useState(0);
  const [position, setPosition] = useState({ x: 125, y: 58 });
  const origin = useRef(position);
  return (
    <section id="interaction" className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">03 / YOUR TURN</p>
          <h2>Made to be played with.</h2>
        </div>
        <p>Go on. Give these a nudge.</p>
      </div>
      <div className="interaction-grid">
        <article className="interaction-card">
          <div>
            <h3>Say hello</h3>
            <p>Hover to brighten. Click to count.</p>
          </div>
          <Paper width={300} height={170} viewbox="0 0 300 170">
            <Circle
              x={150}
              y={82}
              r={42}
              attr={{ ...base, fill: purple, cursor: 'pointer' }}
              click={() => setClicks((value) => value + 1)}
              hover={{
                in() {
                  this.attr({ fill: '#aa8ee8' });
                },
                out() {
                  this.attr({ fill: purple });
                },
              }}
            />
          </Paper>
          <button type="button" onClick={() => setClicks((value) => value + 1)}>
            Click me{' '}
            <span className="count" aria-live="polite">
              {clicks}
            </span>
          </button>
        </article>
        <article className="interaction-card">
          <div>
            <h3>Find your place</h3>
            <p>Drag the square around its canvas.</p>
          </div>
          <Paper width={300} height={170} viewbox="0 0 300 170">
            <Rect
              x={position.x}
              y={position.y}
              width={50}
              height={50}
              r={12}
              attr={{ ...base, fill: green, cursor: 'grab' }}
              drag={{
                start() {
                  origin.current = { x: this.attr('x') ?? 0, y: this.attr('y') ?? 0 };
                },
                move(dx, dy) {
                  const scale = this.paper.canvas.getBoundingClientRect().width / 300;
                  this.attr({
                    x: Math.max(0, Math.min(250, origin.current.x + dx / scale)),
                    y: Math.max(0, Math.min(120, origin.current.y + dy / scale)),
                  });
                },
                end() {
                  setPosition({ x: this.attr('x') ?? 0, y: this.attr('y') ?? 0 });
                },
              }}
            />
          </Paper>
          <button
            type="button"
            onClick={() => setPosition({ x: 125, y: 58 })}
            onKeyDown={(event) => {
              const offsets: Record<string, [number, number]> = {
                ArrowLeft: [-10, 0],
                ArrowRight: [10, 0],
                ArrowUp: [0, -10],
                ArrowDown: [0, 10],
              };
              const delta = offsets[event.key];
              if (!delta) return;
              event.preventDefault();
              setPosition((p) => ({
                x: Math.max(0, Math.min(250, p.x + delta[0])),
                y: Math.max(0, Math.min(120, p.y + delta[1])),
              }));
            }}
            aria-describedby="drag-help"
          >
            Reset position <span aria-hidden="true">↗</span>
          </button>
          <small id="drag-help">Focus the button and use arrow keys to move.</small>
        </article>
      </div>
      <Code>
        {
          '<Circle x={80} y={80} r={30}\n  click={function () { this.attr({ fill: "#e89458" }); }} />\n\n// Refs retain the familiar imperative API.\nconst circle = useRef<ElementHandle>(null);\ncircle.current?.getElement()?.data("score", 10);'
        }
      </Code>
    </section>
  );
}

export function App() {
  return (
    <>
      <header className="header" id="top">
        <a className="brand" href="#top">
          <img src="./mark.svg" width="32" height="32" alt="" />
          react-raphael<span className="brand-label">PLAYGROUND</span>
        </a>
        <nav aria-label="Main">
          <a href="#shapes">Shapes</a>
          <a href="#animation">Animation</a>
          <a href="#interaction">Interaction</a>
        </nav>
        <a className="source-link" href="https://github.com/liuhong1happy/react-raphael">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </header>
      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">
              <span className="tiny-star" aria-hidden="true">
                ✳
              </span>{' '}
              REACT COMPONENTS. VECTOR POSSIBILITIES.
            </p>
            <h1>
              A canvas for
              <br />
              your <em>next idea.</em>
            </h1>
            <p className="hero-description">
              Simple shapes, expressive motion, and a little room to play.
              <br className="desktop-break" /> Bring Raphaël’s vector graphics to your React world.
            </p>
            <div className="hero-actions">
              <a className="primary button" href="#shapes">
                Explore the shapes <span aria-hidden="true">↓</span>
              </a>
              <code>npm i react-raphael raphael</code>
            </div>
            <div className="hero-notes">
              <span>React 18 + 19</span>
              <span>TypeScript ready</span>
              <span>SVG powered</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <Paper width={420} height={340} viewbox="0 0 420 340">
              <Circle x={224} y={154} r={111} attr={{ fill: '#e7e0f4', stroke: 'none' }} />
              <Circle x={246} y={118} r={68} attr={{ fill: purple, stroke: 'none' }} />
              <Rect
                x={64}
                y={152}
                width={115}
                height={115}
                r={22}
                transform="r-14,120,210"
                attr={{ fill: orange, stroke: 'none' }}
              />
              <Path
                d="M192,259Q310,323,347,207"
                attr={{ stroke: green, 'stroke-width': 24, 'stroke-linecap': 'round' }}
              />
              <Path d="M57,88L76,88M66,79L66,98" attr={{ stroke: green, 'stroke-width': 3 }} />
              <Circle x={355} y={85} r={8} attr={{ fill: orange, stroke: 'none' }} />
              <Line
                x1={37}
                y1={288}
                x2={373}
                y2={288}
                attr={{ stroke: '#d9d4cc', 'stroke-dasharray': '.' }}
              />
            </Paper>
            <span className="art-caption">A few primitives. Endless combinations.</span>
          </div>
        </section>
        <section id="shapes" className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / THE BUILDING BLOCKS</p>
              <h2>Meet your new toolkit.</h2>
            </div>
            <p>Eight primitives. One way to bring them together.</p>
          </div>
          <div className="shape-grid">
            {shapes.map((shape, index) => (
              <article className="shape-card" key={shape.name} data-shape={shape.name}>
                <div className="card-meta">
                  <span style={{ color: shape.color }}>
                    ● <span>{shape.name}</span>
                  </span>
                  <span className="card-index">0{index + 1}</span>
                </div>
                <div className="shape-preview">
                  <Paper
                    width={300}
                    height={160}
                    viewbox="0 0 300 160"
                    container={{ role: 'img', 'aria-label': `${shape.name} example` }}
                  >
                    {shape.node}
                  </Paper>
                </div>
                <p>{shape.description}</p>
                <Code>{shape.code}</Code>
              </article>
            ))}
          </div>
        </section>
        <AnimationLab />
        <Interactions />
        <section className="closing">
          <span aria-hidden="true">✳</span>
          <div>
            <h2>Your idea goes here.</h2>
            <p>Start with a shape. See where it takes you.</p>
          </div>
          <a className="button" href="#shapes">
            Back to the playground ↑
          </a>
        </section>
      </main>
      <footer>
        <span className="footer-brand">react-raphael</span>
        <span>Built with React, TypeScript & a love of vectors.</span>
        <span>Open source · MIT</span>
      </footer>
    </>
  );
}
