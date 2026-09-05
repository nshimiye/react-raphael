import { readdir, readFile, writeFile } from 'node:fs/promises';

// Match conditional CommonJS exports with declarations in the same module format.
for (const name of await readdir(new URL('../dist', import.meta.url))) {
  if (!name.endsWith('.d.ts')) continue;
  const source = await readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8');
  await writeFile(
    new URL(`../dist/${name.replace('.d.ts', '.d.cts')}`, import.meta.url),
    source
      .replaceAll(/from '(\.\/[^']+)\.js'/g, "from '$1.cjs'")
      .replaceAll(/^\/\/# sourceMappingURL=.*$/gm, ''),
  );
}
