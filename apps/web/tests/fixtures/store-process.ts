import { JsonStoreRepository } from '../../src/server/repositories/json-store';
const repository = new JsonStoreRepository(process.argv[2]);
try {
  if (process.argv[3] === 'update') await repository.update((store) => { store.settings.name = 'Persistência entre processos'; });
  console.log(JSON.stringify(await repository.read()));
} catch (error) { console.error(error instanceof Error ? error.message : 'Erro'); process.exitCode = 1; }
finally { await repository.close(); }
