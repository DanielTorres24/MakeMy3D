import type { CollectionConfig } from 'payload'
const admins = ({ req }: { req: { user?: { collection?: string } | null } }) => req.user?.collection === 'users'
const staffAccess = { create: admins, read: admins, update: admins, delete: admins }
export const Users: CollectionConfig = {
  slug: 'users', auth: true, admin: { useAsTitle: 'email', group: 'Sistema' },
  access: { create: admins, read: admins, update: admins, delete: admins },
  fields: [{ name: 'name', type: 'text', required: true }, { name: 'role', type: 'select', required: true, defaultValue: 'admin', options: ['admin', 'operator'] }]
}
export const Categories: CollectionConfig = {
  slug: 'categories', admin: { useAsTitle: 'name', group: 'Catálogo' }, access: { read: () => true, create: admins, update: admins, delete: admins },
  fields: [{ name: 'name', type: 'text', required: true }, { name: 'slug', type: 'text', required: true, unique: true }]
}
export const Materials: CollectionConfig = {
  slug: 'materials', admin: { useAsTitle: 'name', group: 'Catálogo' }, access: staffAccess,
  fields: [{ name: 'name', type: 'text', required: true }, { name: 'costPerKg', type: 'number', min: 0 }, { name: 'colors', type: 'array', fields: [{ name: 'label', type: 'text', required: true }, { name: 'hex', type: 'text' }] }]
}
export const Media: CollectionConfig = {
  slug: 'media', upload: { mimeTypes: ['image/*'] }, admin: { group: 'Catálogo' }, access: { read: () => true, create: admins, update: admins, delete: admins },
  fields: [{ name: 'alt', type: 'text', required: true }]
}
export const Products: CollectionConfig = {
  slug: 'products', admin: { useAsTitle: 'name', group: 'Catálogo' }, access: { read: () => true, create: admins, update: admins, delete: admins },
  fields: [
    { name: 'name', type: 'text', required: true }, { name: 'slug', type: 'text', unique: true, required: true },
    { name: 'description', type: 'textarea' }, { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'price', type: 'number', min: 0, required: true, admin: { description: 'Preço em EUR, sem cálculo automático' } },
    { name: 'materials', type: 'relationship', relationTo: 'materials', hasMany: true },
    { name: 'dimensions', type: 'group', fields: [
      { name: 'widthMm', type: 'number', min: 0 }, { name: 'heightMm', type: 'number', min: 0 }, { name: 'depthMm', type: 'number', min: 0 }
    ] },
    { name: 'published', type: 'checkbox', defaultValue: false }
  ]
}
export const Customers: CollectionConfig = {
  slug: 'customers', admin: { useAsTitle: 'email', group: 'Vendas' }, access: staffAccess,
  fields: [{ name: 'name', type: 'text', required: true }, { name: 'email', type: 'email', required: true }, { name: 'phone', type: 'text' }, { name: 'notes', type: 'textarea' }]
}
export const Quotes: CollectionConfig = {
  slug: 'quotes', admin: { useAsTitle: 'title', group: 'Vendas' }, access: staffAccess,
  fields: [
    { name: 'title', type: 'text', required: true }, { name: 'customer', type: 'relationship', relationTo: 'customers' },
    { name: 'product', type: 'relationship', relationTo: 'products' },
    { name: 'quantity', type: 'number', required: true, min: 1, defaultValue: 1 },
    { name: 'material', type: 'relationship', relationTo: 'materials' },
    { name: 'color', type: 'text' }, { name: 'specification', type: 'textarea' },
    { name: 'status', type: 'select', required: true, defaultValue: 'received', options: [
      { label: 'Recebido', value: 'received' }, { label: 'Em análise', value: 'reviewing' },
      { label: 'Proposta enviada', value: 'proposed' }, { label: 'Aprovado', value: 'approved' }, { label: 'Rejeitado', value: 'rejected' }
    ] },
    { name: 'quotedAmount', type: 'number', min: 0 }
  ]
}
export const Orders: CollectionConfig = {
  slug: 'orders', admin: { useAsTitle: 'reference', group: 'Vendas' }, access: staffAccess,
  fields: [
    { name: 'reference', type: 'text', required: true, unique: true },
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true },
    { name: 'quote', type: 'relationship', relationTo: 'quotes' },
    { name: 'items', type: 'array', required: true, fields: [
      { name: 'product', type: 'relationship', relationTo: 'products' }, { name: 'description', type: 'text', required: true },
      { name: 'quantity', type: 'number', min: 1, required: true }, { name: 'unitPrice', type: 'number', min: 0, required: true }
    ] },
    { name: 'total', type: 'number', min: 0, required: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'pending', options: ['pending', 'confirmed', 'production', 'shipped', 'delivered', 'cancelled'] }
  ]
}
export const ProductionJobs: CollectionConfig = {
  slug: 'production-jobs', admin: { useAsTitle: 'title', group: 'Produção' }, access: staffAccess,
  fields: [
    { name: 'title', type: 'text', required: true }, { name: 'order', type: 'relationship', relationTo: 'orders' },
    { name: 'printer', type: 'text' }, { name: 'material', type: 'relationship', relationTo: 'materials' },
    { name: 'estimatedMinutes', type: 'number', min: 0 }, { name: 'grams', type: 'number', min: 0 },
    { name: 'status', type: 'select', required: true, defaultValue: 'queued', options: ['queued','printing','quality-check','done','failed'] }
  ]
}
