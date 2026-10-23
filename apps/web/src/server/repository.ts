import 'server-only';
import path from 'node:path';
import { JsonStoreRepository } from './repositories/json-store';

// globalThis preserva a fila e lease durante hot reload do Next em desenvolvimento.
const state = globalThis as typeof globalThis & { makeMy3DRepository?: JsonStoreRepository };
export function getRepository(): JsonStoreRepository {
  // Dados privados de runtime nunca são incorporados no bundle/build.
  state.makeMy3DRepository ??= new JsonStoreRepository(path.resolve(/* turbopackIgnore: true */ process.env.MAKEMY3D_DATA_DIR || '.data'));
  return state.makeMy3DRepository;
}
