import Link from 'next/link';
import { ProductGrid } from '@/components/catalog';
import { getRepository } from '@/server/repository';
import { publicCategories, visibleProducts } from '@/server/services/catalog-service';
export const dynamic = 'force-dynamic';
const steps = [
  ['01', 'A tua ideia', 'Uma peça útil, uma oferta pessoal ou algo que ainda não existe.'],
  ['02', 'À tua medida', 'Forma, material e cor pensados para o teu projeto.'],
  ['03', 'Camada a camada', 'A impressão 3D dá forma ao desenho digital.'],
  ['04', 'Um novo objeto', 'Da primeira ideia a uma peça que podes ter nas mãos.'],
];
export default async function Home() {
  const store = await getRepository().read();
  const categories = publicCategories(store);
  const products = visibleProducts(store);
  const featured = products.filter((product) => product.featured).slice(0, 6);
  return <main id="conteudo">
    <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow"><span className="status-dot" /> IDEIAS COM VOLUME</p><h1 id="hero-title">IMAGINA.<br />PERSONALIZA.<br /><span>TORNA REAL.</span></h1><p className="intro">Pequenas soluções. Grandes ideias. Um novo espaço para descobrir o que a impressão 3D pode criar contigo.</p><Link className="button" href="/catalogo">Explorar o catálogo <span aria-hidden="true">↗</span></Link><p className="hero-note">Conceitos demonstrativos. Preços indicativos. Ideias para explorar.</p></div><div className="hero-visual" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="model"><div className="model-top" /><div className="model-front" /><div className="model-side" /></div><div className="visual-label"><span>IDEIA → OBJETO</span><span>IMPRESSÃO 3D</span></div><div className="visual-corner">+<br />+</div></div></section>
    <section className="section" aria-labelledby="categories-title"><div className="section-heading"><div><p className="eyebrow">UM MUNDO DE POSSIBILIDADES</p><h2 id="categories-title">Encontra a tua<br />próxima ideia.</h2></div><p>{categories.length} categorias · {products.length} conceitos e serviços<br />Conteúdos originais de demonstração.</p></div>{categories.length ? <div className="home-categories">{categories.map((category, index) => <Link href={`/catalogo?category=${category.slug}`} key={category.id}><span className="category-index">{String(index + 1).padStart(2, '0')}</span><div><h3>{category.name}</h3><p>{category.tagline || 'Explorar esta categoria'} · {category.productCount} ideias</p></div><span aria-hidden="true">↗</span></Link>)}</div> : <p className="muted">O catálogo está a ser preparado. Volta em breve.</p>}</section>
    {featured.length > 0 && <section className="section" aria-labelledby="featured-title"><div className="section-heading"><div><p className="eyebrow">A PRIMEIRA CAMADA</p><h2 id="featured-title">Ideias em destaque.</h2></div><Link href="/catalogo" className="text-link">Ver todo o catálogo →</Link></div><ProductGrid products={featured} categories={categories} /></section>}
    <section className="process section" id="como-funciona" aria-labelledby="process-title"><div className="section-heading"><div><p className="eyebrow">O PROCESSO</p><h2 id="process-title">Tudo começa com<br />uma ideia tua.</h2></div><p>Uma forma de pensar, experimentar<br />e criar em três dimensões.</p></div><div className="step-grid">{steps.map(([number, title, description]) => <article className="step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="project-panel section" id="projeto" aria-labelledby="project-title"><div><p className="eyebrow">PRÓXIMA CAMADA</p><h2 id="project-title">Um espaço para<br />as tuas possibilidades.</h2></div><div><p>Descobre modalidades de impressão e modelação: desde o estudo de uma peça simples até à preparação de um protótipo.</p><p className="muted">Explora os conceitos e serviços desta demonstração. Compras, personalização e pedidos de orçamento estarão disponíveis numa próxima etapa.</p><Link className="button" href="/catalogo?kind=service">Explorar serviços <span aria-hidden="true">↗</span></Link></div></section>
  </main>;
}
