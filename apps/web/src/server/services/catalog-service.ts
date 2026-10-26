import { z } from 'zod';
import type { Store, Product, Category } from '../../domain/schemas';
import type { StoreRepository } from '../repositories/store-repository';

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(100).default(''),
  category: z.string().regex(/^[a-z0-9-]*$/).max(100).default(''),
  kind: z.enum(['', 'physical', 'service']).default(''),
  material: z.enum(['', 'PLA', 'PETG']).default(''),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'name']).default('featured'),
  page: z.coerce.number().int().min(1).max(100000).default(1),
});
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
export const pageSize = 12;
export const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-PT');
export function publicCategories(store: Store) {
  return store.categories.filter((category) => category.active).map((category) => ({ ...category, productCount: store.products.filter((product) => product.active && product.categoryId === category.id).length }));
}
export function visibleProducts(store: Store) {
  const activeIds = new Set(store.categories.filter((category) => category.active).map((category) => category.id));
  return store.products.filter((product) => product.active && activeIds.has(product.categoryId));
}
export function queryCatalog(store: Store, query: CatalogQuery) {
  const categories = publicCategories(store);
  const byId = new Map(categories.map((category) => [category.id, category]));
  const terms = normalizeSearch(query.q).split(/\s+/).filter(Boolean);
  let items = visibleProducts(store).filter((product) => {
    const category = byId.get(product.categoryId)!;
    return (!query.category || category.slug === query.category) && (!query.kind || product.kind === query.kind) && (!query.material || product.materials?.includes(query.material)) && terms.every((term) => normalizeSearch(`${product.name} ${product.description} ${category.name}`).includes(term));
  });
  const compareName = (a: Product, b: Product) => a.name.localeCompare(b.name, 'pt-PT') || a.id.localeCompare(b.id);
  items = items.sort((a, b) => {
    if (query.sort === 'name') return compareName(a, b);
    if (query.sort.startsWith('price')) {
      if (a.priceCents === null) return b.priceCents === null ? compareName(a, b) : 1;
      if (b.priceCents === null) return -1;
      return (query.sort === 'price-asc' ? a.priceCents - b.priceCents : b.priceCents - a.priceCents) || compareName(a, b);
    }
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || compareName(a, b);
  });
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(query.page, pages);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total, pages, page, pageSize, categories };
}
export function findPublicProduct(store: Store, slug: string): { product: Product; category: Category; related: Product[] } | null {
  const products = visibleProducts(store);
  const product = products.find((item) => item.slug === slug);
  if (!product) return null;
  return { product, category: store.categories.find((item) => item.id === product.categoryId)!, related: products.filter((item) => item.categoryId === product.categoryId && item.id !== product.id).slice(0, 3) };
}
export async function readCatalog(repository: StoreRepository, input: unknown) { return queryCatalog(await repository.read(), catalogQuerySchema.parse(input)); }
