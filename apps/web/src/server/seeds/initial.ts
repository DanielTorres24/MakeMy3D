import { createCatalogSeed } from './catalog';
import { storeSchema, type Store } from '../../domain/schemas';

/** Catálogo demonstrativo para armazenamento novo ou reset confirmado. */
export function createInitialStore(): Store {
  return storeSchema.parse({ schemaVersion: 1, revision: 0, updatedAt: new Date().toISOString(), settings: {
    name: 'MakeMy3D', locale: 'pt-PT', currency: 'EUR', demo: true,
    notice: 'Demonstração local. Não são efetuados pagamentos nem encomendas reais.',
  }, ...createCatalogSeed(), customers: [], orders: [], quotes: [], attachments: [] });
}
