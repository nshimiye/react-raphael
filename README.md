# react-raphael

Typed React components for [Raphaël](https://github.com/DmitryBaranovskiy/raphael) vector graphics, animation, and interaction. Supports React 18 and 19, with ESM, CommonJS, and TypeScript declarations.

## Development and playground

Use Node **22.22.2+** in the 22.x line, or **24.15+**. The `.nvmrc` selects Node 22; run `nvm install` to get its current patch.

```sh
npm install
npm run dev
```

Open the URL printed by Vite. The playground demonstrates all eight primitives and nested sets, motion/color/transform/path/synchronized animations, duration and easing controls, clicking, hovering, dragging, keyboard movement, and copyable examples. Reduced-motion preferences pause animations by default.

```sh
npm run typecheck
npm run lint
npm test
npm run build          # dist/: ESM, CommonJS, declarations, source maps
npm run test:package   # pack and verify JavaScript + TypeScript consumers
npm run build:demo     # demo-dist/: static site with relative asset URLs
npm run preview       # preview the production demo
npx playwright install chromium webkit
npm run test:browser   # real SVG integration and playground checks
```

CI checks both React 18 and 19. The old `lib/` directory is retained as a legacy artifact; new builds and package entrypoints use `dist/`. Files under `lib/` are not included in the package or rewritten by the build.

## Installation

```sh
npm install react react-dom raphael react-raphael
```

For this checkout before publishing, run `npm pack` and install the resulting tarball in your game. Installing the existing registry release does **not** install this unreleased modernization.

React and Raphaël are peer dependencies. React DOM is used by your application, not by the library. The package includes Raphaël's supporting types.

```tsx
import { createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Circle, Paper, Set, Text, type ElementHandle } from 'react-raphael';

const circle = createRef<ElementHandle>();

createRoot(document.getElementById('root')!).render(
  <Paper width={400} height={220} viewbox="0 0 400 220">
    <Set attr={{ stroke: 'none' }}>
      <Circle
        ref={circle}
        x={60} y={100} r={30}
        attr={{ fill: '#8061d9' }}
        data={{ score: 0 }}
        animate={{ attrs: { cx: 320 }, duration: 1200, easing: '<>' }}
        click={function () { this.attr({ fill: '#e89458' }); }}
      />
      <Text x={200} y={180} text="Hello, vectors." />
    </Set>
  </Paper>,
);

// Call after mounting, for example in an event handler.
circle.current?.getElement()?.data('score', 10);
```

## API

All existing named exports remain: `Raphael`, `Utils`, `Paper`, `Set`, `Element`, `Circle`, `Ellipse`, `Image`, `Path`, `Print`, `Rect`, `Text`, and `Line`.

| Component | Geometry props and defaults |
| --- | --- |
| `Paper` | `width=100`, `height=100`, `viewbox="x y width height"`; `container` accepts HTML div attributes |
| `Circle` | `x=0`, `y=0`, `r=10` |
| `Ellipse` | `x=0`, `y=0`, `rx=10`, `ry=20` |
| `Rect` | `x=0`, `y=0`, `width=0`, `height=0`, `r=0` |
| `Image` | `src=""`, `x=0`, `y=0`, `width=0`, `height=0` (top-left coordinates) |
| `Path` | `d`: SVG path string, flat command array, or nested segments |
| `Line` | `x1=0`, `y1=0`, `x2=0`, `y2=0` |
| `Text` | `x=0`, `y=0`, `text=""` (supports newlines) |
| `Print` | `x=0`, `y=0`, `text=""`, `fontFamily="Arial"`, `fontSize=16`, `origin="middle"`, `letterSpacing=0`, `lineSpacing=1`; optional font weight/style/stretch |
| `Set` | Nested shapes/sets with shared element props |
| `Element` | Lower-level component with `type` identifying the primitive |

`Print` requires a vector font registered with `Raphael.registerFont`; a system font or CSS web font is insufficient. See `demo/font.ts` for the bundled, original pixel alphabet. Missing fonts produce an actionable error.

### Shared shape and set props

- `attr`: Raphaël attributes such as `fill`, `stroke`, `opacity`, and `stroke-width`.
- `animate`: a native `Raphael.animation(...)` object, or `{ attrs, duration, easing?, callback?, repeat?, delay? }`.
- `animateWith`: `{ element, animation, with? }`, identifying the leader element, its native animation, and an optional follower animation.
- `click`, `dblclick`, mouse and touch events: native Raphaël callbacks. A regular function receives the element as `this`.
- `hover`: `{ in, out, icontext?, ocontext? }`.
- `drag`: `{ move, start?, end?, mcontext?, scontext?, econtext? }`.
- `data`: key/value data available through the imperative element API.
- `transform`: Raphaël transform string or segment array; `translate: { x, y }`, `rotate: { deg, cx?, cy? }`, `scale: { sx, sy?, cx?, cy? }`.
- `glow`: partial Raphaël glow settings; `hide`, `stop`, `toBack`, `toFront`: boolean controls.
- `load` and `update`: callbacks receiving the native element or set. `load` runs after creation; `update` runs for subsequent prop updates. In development Strict Mode, creation callbacks may run twice, with cleanup between runs.

Geometry, attributes, and data are reconciled by changed values. Unchanged props do not reset imperative changes or restart animations. Removing event, hover, drag, glow, transform, or animation props cleans up that behavior. Removing data keys removes those keys. Omitted `attr` keys retain their current Raphaël values; reset them explicitly when needed. Treat all prop objects as immutable.

Sets apply their props to current members and supply initial shared props to new descendants. Initial child props override inherited values; later set updates apply to all current members. A set is a Raphaël collection, not a DOM `<g>`.

Supply a new native animation object or changed animation options to replay a declarative animation. Use `getElement().pause()` / `.resume()` for reversible playback control; `stop` terminates an animation. Line animations additionally accept `x1`, `y1`, `x2`, and `y2`, including zero, without mutating the supplied animation.

### Refs and utilities

`PaperHandle.getPaper()`, `SetHandle.getSet()`, and `ElementHandle.getElement()` return native instances, or `null` outside their mounted lifetime. Object refs and callback refs are supported; callback refs can access the instance immediately on attachment.

`Utils` retains `createPaper`, `updatePaper`, `removePaper`, `create`, `createElement`, `createSet`, `updateElement`, `updateElementProps`, `removeElement`, `removeSet`, `findParentById`, `papers`, and `elements`. Its registries now contain only live instances. Prefer components for React-owned shapes and the removal utilities for manually managed resources. Callbacks and ref handle types are exported alongside component prop types.

## Migrating from 0.9's React 15/16 implementation

Upgrade the consuming app to React 18 or 19 and use `createRoot`. The neighboring game's React upgrade is a separate change. Existing shape names, geometry props, `attr`, events, `Raphael.animation`, and imperative handle methods remain available.

Replace consumer string refs with object or callback refs. Callback refs must handle `null` on detachment:

```tsx
<Circle ref={handle => { movableBall = handle?.getElement() ?? null; }} />
```

Import from `react-raphael`; deep imports into `lib/` are not supported by the new export map. The runtime remains browser-only because Raphaël accesses `window` when imported. In SSR frameworks, load the package from a client-only boundary with server rendering disabled.

Fixed behavior includes set cleanup and updates, removed event handlers, viewport updates, string transforms, glow cleanup, stacking controls, and line animation endpoints. Ref methods and load callbacks are preferable to depending on the old hidden DOM wrappers or timer-based initialization.

## License

MIT. Original library by Holly Liu. The bundled demo mark and pixel font are original assets covered by the same license.
