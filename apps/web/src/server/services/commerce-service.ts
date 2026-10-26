import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { customizationSchema, type Store, type CartItem, type Order, type Quote } from '../../domain/schemas';
import type { StoreRepository } from '../repositories/store-repository';

export class CommerceError extends Error { constructor(message: string, public status = 400) { super(message); } }
const quantity = z.number().int().min(1).max(999);
export const addItemSchema = z.strictObject({ productId: z.uuid(), quantity, customization: customizationSchema });
export const changeItemSchema = z.strictObject({ id: z.uuid(), quantity });
export const contactSchema = z.strictObject({ name: z.string().trim().min(2).max(200), email: z.email().max(254), phone: z.string().trim().max(30).default('') });
export const checkoutSchema = z.strictObject({ customer: contactSchema, consent: z.literal(true) });
export const quoteInputSchema = z.strictObject({ customer: contactSchema, consent: z.literal(true), description: z.string().trim().min(10).max(5000), customization: customizationSchema, quantity });
function cartOf(store: Store, owner: string) { const cart = store.carts.find(c => c.id === owner); if (!cart) throw new CommerceError('Sessão expirada. Atualize a página.', 401); return cart; }
export function assertAttachments(store: Store, ids: string[], owner: string) {
  if (new Set(ids).size !== ids.length || ids.some(id => !store.attachments.some(a => a.id === id && a.ownerId === owner))) throw new CommerceError('Anexo inválido ou pertencente a outra sessão.', 403);
}
export function priceItem(store: Store, item: CartItem, owner: string) {
  const product = store.products.find(p => p.id === item.productId && p.active && store.categories.some(c => c.id === p.categoryId && c.active));
  if (!product || product.priceCents === null) throw new CommerceError('Um artigo está indisponível para compra. Remova-o ou peça orçamento.');
  if (item.customization.material && !product.materials?.includes(item.customization.material as 'PLA' | 'PETG')) throw new CommerceError('Material não disponível para este produto.');
  assertAttachments(store, item.customization.attachmentIds, owner);
  return { ...item, name: product.name, unitPriceCents: product.priceCents };
}
export async function createCustomerSession(repo: StoreRepository) {
  const id = randomUUID(), now = new Date().toISOString();
  await repo.update(s => { s.carts.push({ id, createdAt: now, updatedAt: now, items: [] }); });
  return id;
}
export async function getCart(repo: StoreRepository, owner: string) {
  const store = await repo.read(); const cart = cartOf(store, owner);
  const items = cart.items.map(item => { try { return { ...priceItem(store, item, owner), available: true }; } catch { return { ...item, name: store.products.find(p => p.id === item.productId)?.name ?? 'Artigo indisponível', unitPriceCents: 0, available: false }; } });
  return { items, totalCents: items.reduce((sum, i) => sum + i.quantity * i.unitPriceCents, 0) };
}
export async function addItem(repo: StoreRepository, owner: string, input: unknown) {
  const data = addItemSchema.parse(input);
  await repo.update(s => { const cart = cartOf(s, owner); if (cart.items.length >= 50) throw new CommerceError('Máximo de 50 artigos por carrinho.'); const item = { ...data, id: randomUUID() }; priceItem(s, item, owner); cart.items.push(item); cart.updatedAt = new Date().toISOString(); });
  return getCart(repo, owner);
}
export async function changeItem(repo: StoreRepository, owner: string, input: unknown) {
  const data = changeItemSchema.parse(input);
  await repo.update(s => { const cart = cartOf(s, owner), item = cart.items.find(i => i.id === data.id); if (!item) throw new CommerceError('Artigo não encontrado.', 404); item.quantity = data.quantity; cart.updatedAt = new Date().toISOString(); });
  return getCart(repo, owner);
}
export async function removeItem(repo: StoreRepository, owner: string, input: unknown) {
  const id = z.uuid().parse(input);
  await repo.update(s => { const cart = cartOf(s, owner); cart.items = cart.items.filter(i => i.id !== id); cart.updatedAt = new Date().toISOString(); });
  return getCart(repo, owner);
}
export async function checkout(repo: StoreRepository, owner: string, input: unknown) {
  const data = checkoutSchema.parse(input); let result!: Order;
  await repo.update(s => {
    const cart = cartOf(s, owner); if (!cart.items.length) throw new CommerceError('O carrinho está vazio.');
    const now = new Date().toISOString(), id = randomUUID();
    const customer = { ...data.customer, id: randomUUID(), createdAt: now, updatedAt: now };
    const items = cart.items.map(i => priceItem(s, i, owner));
    result = { id, createdAt: now, updatedAt: now, reference: `MM3D-${id.toUpperCase()}`, customer, items, totalCents: items.reduce((sum,i) => sum+i.quantity*i.unitPriceCents,0), status: 'received', history: [{id: randomUUID(), status: 'received', at: now, note: 'Encomenda simulada, sem pagamento.'}], simulated: true, ownerId: owner, notes: '' };
    if (result.totalCents > 100_000_000) throw new CommerceError('Valor máximo da demonstração excedido. Peça orçamento.');
    s.customers.push(customer); s.orders.push(result); cart.items = []; cart.updatedAt = now;
  });
  return result;
}
export async function createQuote(repo: StoreRepository, owner: string, input: unknown) {
  const data = quoteInputSchema.parse(input); let result!: Quote;
  await repo.update(s => {
    cartOf(s, owner); assertAttachments(s, data.customization.attachmentIds, owner);
    const now = new Date().toISOString(), id = randomUUID(); const customer = { ...data.customer, id: randomUUID(), createdAt: now, updatedAt: now };
    result = { id, reference: `ORC-${id.toUpperCase()}`, createdAt: now, updatedAt: now, customer, description: data.description, customization: data.customization, status: 'received', ownerId: owner, quantity: data.quantity, notes: '', history: [{id:randomUUID(), status:'received', at:now, note:'Pedido demonstrativo recebido.'}] };
    s.customers.push(customer); s.quotes.push(result);
  });
  return result;
}

