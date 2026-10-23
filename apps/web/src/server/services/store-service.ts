import type { StoreRepository } from '../repositories/store-repository';

export async function getStoreHealth(repository: StoreRepository) {
  const store = await repository.read();
  // Sem caminhos locais, contactos, conteúdo de pedidos ou detalhes de erro.
  return { status: 'ok' as const, application: 'MakeMy3D', mode: 'local-demo' as const, schemaVersion: store.schemaVersion };
}
