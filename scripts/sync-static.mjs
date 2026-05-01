import { cp, copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const publicDir = path.join(root, 'public');
const publicDataJs = path.join(publicDir, 'data.js');

await mkdir(publicDir, { recursive: true });
await rm(publicDataJs, { force: true });

await copyFile(path.join(root, 'style.css'), path.join(publicDir, 'style.css'));
await copyFile(path.join(root, 'CNAME'), path.join(publicDir, 'CNAME'));

const publicAssets = path.join(publicDir, 'assets');
await rm(publicAssets, { recursive: true, force: true });
await cp(path.join(root, 'assets'), publicAssets, { recursive: true });
