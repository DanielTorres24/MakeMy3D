import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function loadProjectEnvironment(directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../apps/web')) {
  // Uma configuração partilhada entre servidor, seed e reset. Variáveis do terminal prevalecem.
  for (const mode of ['development', 'production', 'test']) {
    for (const suffix of ['', '.local']) {
      if (existsSync(path.join(directory, `.env.${mode}${suffix}`))) throw new Error('Use apenas apps/web/.env.local (ou .env): configurações por modo podem repor dados diferentes dos utilizados pelo servidor.');
    }
  }
  for (const file of ['.env.local', '.env']) {
    const target = path.join(directory, file);
    if (existsSync(target)) process.loadEnvFile(target);
  }
}
