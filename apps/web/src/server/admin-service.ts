import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { categorySchema, productSchema, orderStatusSchema, quoteSchema, storeSettingsSchema, type Store } from '../domain/schemas';
import { AdminError } from './admin-session';
export const adminMutationSchema = z.strictObject({ entity: z.enum(['products', 'categories', 'orders', 'quotes', 'settings']), action: z.enum(['save', 'delete']), id: z.uuid().optional(), data: z.unknown().optional() });
export function mutateAdmin(store: Store, raw: unknown) {
 const input = adminMutationSchema.parse(raw); const now = new Date().toISOString();
 if (input.entity === 'products' || input.entity === 'categories') {
 const collection = store[input.entity]; const existing = collection.find(item => item.id === input.id);
 if (input.id && !existing) throw new AdminError(404, 'Registo não encontrado.');
 if (input.action === 'delete') { if (!existing) throw new AdminError(404, 'Registo não encontrado.'); if (input.entity === 'categories' && store.products.some(p => p.categoryId === input.id)) throw new AdminError(409, 'A categoria contém produtos. Desative-a ou mova os produtos primeiro.'); if (input.entity === 'products') store.products = store.products.filter(p => p.id !== input.id); else store.categories = store.categories.filter(c => c.id !== input.id); return; }
 const supplied = z.record(z.string(), z.unknown()).parse(input.data); const record = { ...existing, ...supplied, id: existing?.id || randomUUID(), createdAt: existing?.createdAt || now, updatedAt: now };
 z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200).parse(supplied.slug ?? existing?.slug);
 const parsed = input.entity === 'products' ? productSchema.parse(record) : categorySchema.parse(record);
 if (collection.some(item => item.slug === parsed.slug && item.id !== parsed.id)) throw new AdminError(409, 'Este endereço (slug) já existe.');
 if (input.entity === 'products') { const product = productSchema.parse(parsed); if (!store.categories.some(c => c.id === product.categoryId)) throw new AdminError(400, 'Selecione uma categoria existente.'); store.products = [...store.products.filter(p => p.id !== product.id), product]; }
 else { const category = categorySchema.parse(parsed); store.categories = [...store.categories.filter(c => c.id !== category.id), category]; } return;
 }
 if (input.action !== 'save') throw new AdminError(400, 'Operação não permitida.');
 if (input.entity === 'settings') { store.settings = storeSettingsSchema.parse(input.data); return; }
 if (input.entity === 'orders') { const data = z.strictObject({ status: orderStatusSchema, notes: z.string().max(2000) }).parse(input.data); const order = store.orders.find(o => o.id === input.id); if (!order) throw new AdminError(404, 'Encomenda inexistente.'); order.status = data.status; order.notes = data.notes; order.updatedAt = now; order.history.push({ id: randomUUID(), status: data.status, at: now, note: data.notes }); return; }
 const data = z.strictObject({ status: quoteSchema.shape.status, notes: z.string().max(2000) }).parse(input.data); const quote = store.quotes.find(q => q.id === input.id); if (!quote) throw new AdminError(404, 'Orçamento inexistente.'); quote.status = data.status; quote.notes = data.notes; quote.updatedAt = now; quote.history.push({ id: randomUUID(), status: data.status, at: now, note: data.notes });
}
export function adminSnapshot(store: Store) { return { products: store.products, categories: store.categories, orders: store.orders, quotes: store.quotes, customers: store.customers, settings: store.settings, attachments: store.attachments.map(({ id, originalName, sizeBytes }) => ({ id, originalName, sizeBytes })), metrics: { orders: store.orders.length, quotes: store.quotes.length, activeProducts: store.products.filter(p => p.active && store.categories.some(c => c.id === p.categoryId && c.active)).length, simulatedCents: store.orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalCents, 0) } }; }

