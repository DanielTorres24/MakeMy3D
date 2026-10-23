import { z } from 'zod';

const id = z.uuid();
const timestamp = z.iso.datetime();
const money = z.number().int().min(0).max(100_000_000);
const text = z.string().trim().min(1).max(200);
const quantity = z.number().int().min(1).max(999);
const entity = { id, createdAt: timestamp, updatedAt: timestamp };
export const categorySchema = z.strictObject({ ...entity, name: text, slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), active: z.boolean() });
export const provenanceSchema = z.strictObject({ sourceUrl: z.url().nullable(), author: text.nullable(), rights: z.enum(['original-demo', 'verified-permission', 'reference-only']), licenceNote: z.string().max(2000) });
export const productSchema = z.strictObject({ ...entity, categoryId: id, name: text, slug: text, description: z.string().max(5000), kind: z.enum(['physical', 'service']), priceCents: money.nullable(), active: z.boolean(), provenance: provenanceSchema });
export const customizationSchema = z.strictObject({ text: z.string().max(200).default(''), colour: z.string().max(80).default(''), material: z.string().max(80).default(''), dimensions: z.string().max(200).default(''), notes: z.string().max(2000).default(''), attachmentIds: z.array(id).max(5).default([]) });
export const cartItemSchema = z.strictObject({ id, productId: id, quantity, customization: customizationSchema });
export const customerSchema = z.strictObject({ ...entity, name: text, email: z.email(), phone: z.string().max(30).default('') });
export const orderStatusSchema = z.enum(['received', 'reviewing', 'in-production', 'ready', 'completed', 'cancelled']);
export const orderStatusHistorySchema = z.strictObject({ id, status: orderStatusSchema, at: timestamp, note: z.string().max(2000) });
export const orderItemSchema = z.strictObject({ id, productId: id, name: text, unitPriceCents: money, quantity, customization: customizationSchema });
export const orderSchema = z.strictObject({ ...entity, reference: text, customer: customerSchema, items: z.array(orderItemSchema).min(1), totalCents: money, status: orderStatusSchema, history: z.array(orderStatusHistorySchema).min(1), simulated: z.literal(true) });
export const quoteSchema = z.strictObject({ ...entity, reference: text, customer: customerSchema, description: z.string().min(1).max(5000), customization: customizationSchema, status: z.enum(['received', 'reviewing', 'answered', 'closed']) });
export const attachmentSchema = z.strictObject({ ...entity, originalName: text, storageName: z.string().regex(/^[a-f0-9-]+\.(stl|3mf|png|jpg|jpeg|webp)$/), mediaType: text, sizeBytes: z.number().int().positive().max(20 * 1024 * 1024), ownerId: id });
export const storeSettingsSchema = z.strictObject({ name: text, locale: z.literal('pt-PT'), currency: z.literal('EUR'), demo: z.literal(true), notice: z.string().min(1).max(1000) });
export const storeSchema = z.strictObject({
  schemaVersion: z.literal(1), revision: z.number().int().nonnegative(), updatedAt: timestamp,
  settings: storeSettingsSchema, categories: z.array(categorySchema), products: z.array(productSchema),
  customers: z.array(customerSchema), orders: z.array(orderSchema), quotes: z.array(quoteSchema), attachments: z.array(attachmentSchema),
}).superRefine((store, ctx) => {
  for (const key of ['categories', 'products', 'customers', 'orders', 'quotes', 'attachments'] as const) {
    const ids = store[key].map((item) => item.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', path: [key], message: 'IDs duplicados.' });
  }
  const categories = new Set(store.categories.map((item) => item.id));
  for (const product of store.products) if (!categories.has(product.categoryId)) ctx.addIssue({ code: 'custom', path: ['products'], message: 'Categoria inexistente.' });
  for (const order of store.orders) {
    if (order.totalCents !== order.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0)) ctx.addIssue({ code: 'custom', path: ['orders'], message: 'Total inconsistente.' });
  }
});
export type Store = z.infer<typeof storeSchema>;
export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Customization = z.infer<typeof customizationSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type OrderStatusHistory = z.infer<typeof orderStatusHistorySchema>;
export type StoreSettings = z.infer<typeof storeSettingsSchema>;
