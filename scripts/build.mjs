import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, 'src'), output, { recursive: true });
await cp(path.join(root, 'data'), path.join(output, 'data'), { recursive: true });
await cp(path.join(root, 'docs'), path.join(output, 'docs'), { recursive: true });

const docs = (await readdir(path.join(root, 'docs')))
  .filter((name) => name.toLowerCase().endsWith('.md'))
  .sort((a, b) => a.localeCompare(b, 'es'));
const manifest = await Promise.all(docs.map(async (file) => {
  const source = await readFile(path.join(root, 'docs', file), 'utf8');
  const title = source.match(/^#\s+(.+)$/m)?.[1]?.trim() || file.replace(/\.md$/i, '').replaceAll('_', ' ');
  const description = source.split('\n').map((line) => line.trim()).find((line) => line && !line.startsWith('#') && !line.startsWith('>'))?.replace(/[*`]/g, '').slice(0, 150) || '';
  return { file, title, description, bytes: Buffer.byteLength(source) };
}));
await writeFile(path.join(output, 'docs', 'manifest.json'), JSON.stringify(manifest, null, 2));
await writeFile(path.join(output, 'build.json'), JSON.stringify({ builtAt: new Date().toISOString(), docs: docs.length }, null, 2));
console.log(`Built dashboard: ${docs.length} Markdown documents → ${output}`);
