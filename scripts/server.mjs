import { createServer } from 'node:http';
import next from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadProjectEnvironment } from './env.mjs';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../apps/web');
process.chdir(directory);
loadProjectEnvironment(directory);
const dev = !process.argv.includes('--production');
process.env.NODE_ENV = dev ? 'development' : 'production';
const portText = process.env.PORT || '3000';
if (!/^\d+$/.test(portText) || Number(portText) < 1024 || Number(portText) > 65535) throw new Error('PORT inválida.');
const port = Number(portText);
const hostname = '127.0.0.1';
const app = next({ dev, dir: directory, hostname, port });
const handler = app.getRequestHandler();
const server = createServer((request, response) => { if (![hostname + ':' + port, 'localhost:' + port].includes(request.headers.host)) { response.writeHead(403); response.end('Host não autorizado.'); return; } handler(request, response).catch(() => { if (!response.headersSent) response.writeHead(500); response.end('Erro interno.'); }); });
let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  server.closeIdleConnections();
  await new Promise((resolve) => server.close(resolve));
  await app.close();
  process.exit(0); // executa os handlers exit do lease JSON
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('message', (message) => { if (message?.type === 'shutdown') void shutdown(); });
if (process.connected) process.on('disconnect', shutdown);
server.on('error', (error) => { console.error(`Servidor não iniciado: ${error.code || 'IO'}`); process.exit(1); });
try {
  await app.prepare();
  server.listen(port, hostname, () => console.log(`MakeMy3D ${dev ? 'dev' : 'produção local'}: http://${hostname}:${port}`));
} catch (error) { console.error(error instanceof Error ? error.message : 'Falha ao iniciar.'); process.exit(1); }
