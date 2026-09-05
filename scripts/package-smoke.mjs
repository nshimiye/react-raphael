import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const fixture = await mkdtemp(join(tmpdir(), 'react-raphael-package-'));
const env = { ...process.env, PATH: `${dirname(process.execPath)}:${process.env.PATH}` };
try {
  const packed = JSON.parse(
    execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', fixture], {
      cwd: repo,
      env,
      encoding: 'utf8',
    }),
  );
  assert(packed[0].files.some((file) => file.path === 'dist/index.d.cts'));
  assert(
    !packed[0].files.some((file) => file.path.startsWith('lib/') || file.path.startsWith('demo/')),
  );
  execFileSync('tar', ['-xzf', join(fixture, packed[0].filename), '-C', fixture]);
  await mkdir(join(fixture, 'node_modules'));
  await symlink(join(fixture, 'package'), join(fixture, 'node_modules/react-raphael'));
  for (const entry of await readdir(join(repo, 'node_modules'))) {
    if (entry.startsWith('.')) continue;
    await symlink(join(repo, 'node_modules', entry), join(fixture, 'node_modules', entry));
  }
  await writeFile(join(fixture, 'package.json'), '{"type":"module"}');
  const runtime = `
    import assert from 'node:assert/strict';
    import { createRequire } from 'node:module';
    import { JSDOM } from 'jsdom';
    const dom = new JSDOM('<!doctype html><div id="root"></div>');
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    window.SVGAngle = class {};
    const esm = await import('react-raphael');
    const cjs = createRequire(import.meta.url)('react-raphael');
    for (const name of ['Paper','Set','Element','Circle','Ellipse','Image','Path','Print','Rect','Text','Line','Utils','Raphael']) {
      assert(esm[name], 'Missing ESM export ' + name);
      assert(cjs[name], 'Missing CommonJS export ' + name);
    }
    assert.equal(esm.Raphael, cjs.Raphael);
    assert.equal(typeof esm.Raphael.animation, 'function');
    dom.window.close();
  `;
  await writeFile(join(fixture, 'smoke.mjs'), runtime);
  execFileSync(process.execPath, ['smoke.mjs'], { cwd: fixture, env, stdio: 'inherit' });
  const source = `
    import { createElement, createRef } from 'react';
    import { Circle, Paper, Raphael, type ElementHandle, type CircleProps } from 'react-raphael';
    const ref = createRef<ElementHandle>();
    const props: CircleProps = { x: 0, r: 20, animate: { attrs: { cx: 40 }, duration: 100 }, glow: { width: 5 } };
    createElement(Paper, { width: 200 }, createElement(Circle, { ...props, ref }));
    ref.current?.getElement()?.data('score', 1);
    Raphael.animation({ 50: { cx: 0 }, 100: { cx: 10 } }, 100);
    Raphael(document.createElement('div'), 100, 100);
    // @ts-expect-error Coordinates must be numeric.
    const invalid: CircleProps = { x: 'invalid' };
  `;
  await writeFile(join(fixture, 'consumer.mts'), source);
  await writeFile(join(fixture, 'consumer.cts'), source);
  await writeFile(
    join(fixture, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        types: ['react'],
      },
      include: ['consumer.mts', 'consumer.cts'],
    }),
  );
  execFileSync(
    process.execPath,
    [join(repo, 'node_modules/typescript/bin/tsc'), '-p', join(fixture, 'tsconfig.json')],
    { cwd: fixture, env, stdio: 'inherit' },
  );
  const manifest = JSON.parse(await readFile(join(fixture, 'package/package.json'), 'utf8'));
  console.log(
    `Package verified: ${manifest.name}@${manifest.version}; ESM, CommonJS, and both declaration formats.`,
  );
} finally {
  await rm(fixture, { recursive: true, force: true });
}
