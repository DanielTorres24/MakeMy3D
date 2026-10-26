import { it, expect } from 'vitest';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

it('partilha .env.local com precedência do terminal e recusa configuração divergente por modo', async () => {
  const root = path.resolve('../../work/tests');
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(path.join(root, 'env-test-'));
  try {
    await writeFile(path.join(directory, '.env.local'), 'MAKEMY3D_DATA_DIR=.data-personalizada\nPORT=3199\n');
    const moduleUrl = pathToFileURL(path.resolve('../../scripts/env.mjs')).href;
    const code = `import {loadProjectEnvironment} from ${JSON.stringify(moduleUrl)}; loadProjectEnvironment(process.argv[1]); console.log(process.env.MAKEMY3D_DATA_DIR + ':' + process.env.PORT);`;
    const env = { ...process.env };
    delete env.MAKEMY3D_DATA_DIR; delete env.PORT;
    const first = spawnSync(process.execPath, ['--input-type=module', '-e', code, directory], { env, encoding: 'utf8' });
    expect(first.status, first.stderr).toBe(0);
    expect(first.stdout.trim()).toBe('.data-personalizada:3199');
    const terminal = spawnSync(process.execPath, ['--input-type=module', '-e', code, directory], { env: { ...env, PORT: '3200' }, encoding: 'utf8' });
    expect(terminal.stdout.trim()).toBe('.data-personalizada:3200');
    await writeFile(path.join(directory, '.env.production'), 'MAKEMY3D_DATA_DIR=.outros');
    const conflicting = spawnSync(process.execPath, ['--input-type=module', '-e', code, directory], { env, encoding: 'utf8' });
    expect(conflicting.status).toBe(1);
    expect(conflicting.stderr).toContain('Use apenas apps/web/.env.local');
  } finally {
    if (path.dirname(directory) !== root || !path.basename(directory).startsWith('env-test-')) throw new Error('Limpeza inválida.');
    await rm(directory, { recursive: true, force: true });
  }
});
