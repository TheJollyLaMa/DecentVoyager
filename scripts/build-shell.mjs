import { build } from 'esbuild';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'src');
const output = path.join(site, 'build');
await rm(output, { recursive: true, force: true });
await build({
  absWorkingDir: root,
  entryPoints: ['src/js/shell/app-entry.mjs'],
  outdir: output,
  entryNames: 'app',
  chunkNames: 'chunks/[name]-[hash]',
  bundle: true,
  splitting: true,
  format: 'esm',
  target: ['es2022'],
  plugins: [{
    name: 'preserve-source-module-urls',
    setup(builder) {
      builder.onLoad({ filter: /\.[cm]?js$/ }, async args => {
        const source = await readFile(args.path, 'utf8');
        if (!source.includes('import.meta.url')) return;
        const relative = path.relative(site, args.path).split(path.sep).join('/');
        if (relative.startsWith('../')) throw new Error(`Module outside site: ${relative}`);
        return {
          contents: source.replaceAll('import.meta.url', `new URL(${JSON.stringify(relative)}, document.baseURI).href`),
          loader: 'js',
          resolveDir: path.dirname(args.path)
        };
      });
    }
  }]
});
