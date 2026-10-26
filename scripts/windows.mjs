import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProjectEnvironment } from './env.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'apps', 'web');
loadProjectEnvironment(web);
const command = process.argv[2];
const flags = new Set(process.argv.slice(3));
const port = process.env.PORT || '3000';
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) throw new Error('PORT deve ser um inteiro entre 1024 e 65535.');
const url = `http://127.0.0.1:${port}`;
const noBrowser = flags.has('--no-browser') || flags.has('--smoke');

function run(executable, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd: root, stdio: 'inherit', windowsHide: true, ...options });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Comando terminou com código ${code}.`)));
  });
}
const npm = (args) => run(process.platform === 'win32' ? 'cmd.exe' : 'npm', process.platform === 'win32' ? ['/d', '/s', '/c', 'npm', ...args] : args);
function installed() { if (!existsSync(path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next'))) throw new Error('Dependências em falta. Execute 01_INSTALAR.bat.'); }
async function health() {
  try {
    const response = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(3000), cache: 'no-store' });
    const body = await response.json();
    return response.ok && body.application === 'MakeMy3D' && body.mode === 'local-demo';
  } catch { return false; }
}
async function browse(target) {
  console.log(`Disponível: ${target}`);
  if (!noBrowser) await run('rundll32.exe', ['url.dll,FileProtocolHandler', target]);
}
async function start() {
  installed();
  if (await health()) { console.log('A loja já está ativa.'); await browse(url); return; }
  const child = spawn(process.execPath, [path.join(root, 'scripts', 'server.mjs'), ...(flags.has('--production') ? ['--production'] : [])], { cwd: web, stdio: ['inherit', 'inherit', 'inherit', 'ipc'], windowsHide: true, env: process.env });
  let exited = false;
  let spawnError;
  const finished = new Promise((resolve) => {
    child.on('error', (error) => { spawnError = error; exited = true; resolve({ code: 1 }); });
    child.on('exit', (code, signal) => { exited = true; resolve({ code, signal }); });
  });
  // Só termina a árvore criada por este script, nunca processos por nome/porta.
  async function stopOwnedChild() {
    if (exited) return;
    if (child.connected) child.send({ type: 'shutdown' });
    else child.kill('SIGTERM');
    await finished;
  }
  const onInterrupt = () => { void stopOwnedChild(); };
  process.on('SIGINT', onInterrupt);
  process.on('SIGTERM', onInterrupt);
  try {
    let ready = false;
    for (let attempt = 0; attempt < 90 && !exited; attempt++) {
      if (await health()) { ready = true; break; }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!ready) throw spawnError || new Error('A loja não ficou pronta. Consulte os erros acima e a documentação de locks.');
    await browse(url);
    if (flags.has('--smoke')) {
      for (const route of ['/', '/admin', '/api/health']) {
        const response = await fetch(url + route);
        if (!response.ok) throw new Error(`Smoke falhou: ${route} devolveu ${response.status}.`);
        console.log(`SMOKE ${route}: ${response.status}`);
      }
      await stopOwnedChild();
      return;
    }
    console.log('Mantenha este terminal aberto. Use Ctrl+C para parar.');
    const result = await finished;
    if (result.code && result.code !== 130) throw new Error(`Servidor terminou com código ${result.code}.`);
  } catch (error) { await stopOwnedChild(); throw error; }
  finally { process.removeListener('SIGINT', onInterrupt); process.removeListener('SIGTERM', onInterrupt); }
}
async function main() {
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Instale Node.js 22 ou superior; validado em Node 24 LTS.');
  await run('git', ['--version']);
  if (!['install', 'start', 'admin', 'reset', 'test'].includes(command)) throw new Error('Operação desconhecida.');
  if (flags.has('--check')) { console.log(`Configuração válida: ${command}; raiz ${root}; ${url}`); return; }
  if (command === 'install') { await npm(['ci', '--no-fund']); console.log('Instalação concluída. Execute 02_INICIAR_LOJA.bat.'); }
  if (command === 'test') { installed(); await npm(['run', 'check']); }
  if (command === 'reset') { installed(); await npm(['run', 'reset']); }
  if (command === 'admin') {
    if (!await health()) throw new Error('A loja não está disponível. Execute 02_INICIAR_LOJA.bat primeiro.');
    await browse(`${url}/admin`);
  }
  if (command === 'start') await start();
}
main().catch((error) => { console.error(`ERRO: ${error.message}`); process.exitCode = 1; });
