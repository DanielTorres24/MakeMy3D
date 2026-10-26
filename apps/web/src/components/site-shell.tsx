import Link from 'next/link';
export function SiteHeader() {
  return <header className="site-header"><Link className="brand" href="/" aria-label="MakeMy3D — início">MAKE<span>MY</span>3D<span className="brand-dot">.</span></Link><nav aria-label="Navegação principal"><Link href="/catalogo">Catálogo</Link><Link href="/catalogo?kind=service">Serviços</Link><Link href="/orcamento">Pedir orçamento</Link><Link className="nav-cart" href="/carrinho">Carrinho <span aria-hidden="true">↗</span></Link></nav></header>;
}
export function SiteFooter() {
  return <footer className="site-footer"><div><p className="brand">MAKE<span>MY</span>3D.</p><p>Ideias tuas. Possibilidades em 3D.</p></div><nav aria-label="Ligações úteis"><Link href="/catalogo">Explorar catálogo</Link><Link href="/orcamento">Pedir orçamento</Link><Link href="/#como-funciona">Como funciona</Link><Link href="/admin">Área de gestão</Link></nav><p className="muted">Demonstração local · Sem pagamentos reais</p></footer>;
}
