import Image from 'next/image';
import Link from 'next/link';
import type { Product, Category } from '@/domain/schemas';
export function formatPrice(value: number | null) { return value === null ? 'Sob consulta' : new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value / 100); }
export function ProductCard({ product, category }: { product: Product; category?: Category }) {
  return <article className="product-card"><Link href={`/produtos/${encodeURIComponent(product.slug)}`} className="product-link">
    <div className="product-art">{product.image ? <Image src={product.image} width={640} height={480} alt="" /> : <div className="art-fallback" aria-hidden="true">3D</div>}<span className="art-label">Ilustração de conceito</span></div>
    <div className="product-body"><p className="product-category">{category?.name ?? (product.kind === 'service' ? 'Serviço' : 'Objeto')}</p><h3>{product.name}</h3><p className="product-summary">{product.summary || product.description}</p><div className="product-bottom"><span><strong>{formatPrice(product.priceCents)}</strong><small>Preço indicativo</small></span><span aria-hidden="true" className="product-arrow">↗</span></div></div>
  </Link></article>;
}
export function ProductGrid({ products, categories }: { products: Product[]; categories: Category[] }) { return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} category={categories.find((category) => category.id === product.categoryId)} />)}</div>; }
