import { storeSchema, type Store } from '../../domain/schemas';

/** Fase 1: sem inventar catálogo, clientes ou encomendas de fases futuras. */
export function createInitialStore(): Store {
  return storeSchema.parse({ schemaVersion: 1, revision: 0, updatedAt: new Date().toISOString(), settings: {
    name: 'MakeMy3D', locale: 'pt-PT', currency: 'EUR', demo: true,
    notice: 'Demonstração local. Não são efetuados pagamentos nem encomendas reais.',
  }, categories: [], products: [], customers: [], orders: [], quotes: [], attachments: [] });
}
