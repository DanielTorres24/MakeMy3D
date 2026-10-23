import path from 'node:path';
import { readFile, rename, realpath, lstat } from 'node:fs/promises';
import { z } from 'zod';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { JsonStoreRepository } from '../src/server/repositories/json-store';
import { loadProjectEnvironment } from '../../../scripts/env.mjs';

loadProjectEnvironment();
const directory = path.resolve(process.env.MAKEMY3D_DATA_DIR || '.data');
const action = process.argv[2];
async function confirm(message: string, expected: string) {
  const terminal = createInterface({ input: stdin, output: stdout });
  try { return (await terminal.question(message)).trim() === expected; }
  finally { terminal.close(); }
}
async function main() {
  if (action === 'recover-lock') {
    // Reutiliza as restrições do adaptador antes de qualquer operação de disco.
    new JsonStoreRepository(directory);
    if ((await realpath(directory)).toLowerCase() !== directory.toLowerCase()) throw new Error('Pasta com symlink não permitida.');
    const lockFile = path.join(directory, '.writer.lock');
    const stat = await lstat(lockFile);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Lock não é um ficheiro regular.');
    const raw = await readFile(lockFile, 'utf8');
    const lock = z.strictObject({ pid: z.number().int().positive(), token: z.uuid(), startedAt: z.iso.datetime() }).parse(JSON.parse(raw));
    try { process.kill(lock.pid, 0); throw new Error('O processo do lock ainda está ativo. Pare-o normalmente.'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error; }
    console.log('Recuperação de lock órfão. Pare todas as instâncias e não inicie outra durante esta operação.');
    if (!await confirm('Escreva RECUPERAR LOCK para continuar: ', 'RECUPERAR LOCK')) { console.log('Cancelado.'); return; }
    // Revalidar após interação humana; nunca recuperar lock entretanto alterado.
    if (await readFile(lockFile, 'utf8') !== raw) throw new Error('O lock mudou; operação cancelada.');
    try { process.kill(lock.pid, 0); throw new Error('O PID está novamente em utilização; operação cancelada.'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error; }
    await rename(lockFile, path.join(directory, `.writer-recovered-${Date.now()}-${lock.token}.json`));
    console.log('Lock preservado em cópia de recuperação. Os dados não foram alterados.');
    return;
  }
  if (action !== 'seed' && action !== 'reset') throw new Error('Utilize seed, reset ou recover-lock.');
  const repository = new JsonStoreRepository(directory);
  try {
    if (action === 'seed') { await repository.read(); console.log('Dados válidos; seed criado apenas se inexistente.'); return; }
    console.log(`Reposição da demonstração em ${directory}. O servidor deve estar parado.`);
    console.log('O JSON atual terá uma cópia de segurança. Uploads e backups anteriores não serão apagados.');
    if (!await confirm('Escreva REPOR DEMO para continuar: ', 'REPOR DEMO')) { console.log('Cancelado. Nenhum dado alterado.'); return; }
    console.log(`Demonstração reposta. Backup: ${await repository.reset('REPOR DEMO')}`);
  } finally { await repository.close(); }
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : 'Falha na operação de dados.'); process.exitCode = 1; });
