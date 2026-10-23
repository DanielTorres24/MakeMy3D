import { categorySchema, productSchema, type Store } from '../../domain/schemas';
import data from './catalog-data.json';

export const catalogVersion = data.version;
export function createCatalogSeed() {
  const dates = { createdAt: '2026-10-23T00:00:00.000Z', updatedAt: '2026-10-23T00:00:00.000Z' };
  return {
    categories: data.categories.map((item) => categorySchema.parse({ ...item, ...dates })),
    products: data.products.map((item) => productSchema.parse({ ...item, ...dates })),
  };
}
/** Pure additive plan: validate all collisions before mutating the draft. Existing entities win. */
export function planCatalogAddition(store: Store) {
  const seed = createCatalogSeed();
  for (const key of ['categories', 'products'] as const) {
    for (const item of seed[key]) {
      const sameSlug = store[key].find((existing) => existing.slug === item.slug);
      if (sameSlug && sameSlug.id !== item.id) throw new Error(`Conflito de slug no catálogo: ${item.slug}. Nenhum dado alterado.`);

    }
  }
  return {
    categories: seed.categories.filter((item) => !store.categories.some((existing) => existing.id === item.id)),
    products: seed.products.filter((item) => !store.products.some((existing) => existing.id === item.id)),
  };
}
