import Link from 'next/link';
export function SiteHeader() {
  return <header className="site-header"><Link className="brand" href="/" aria-label="MakeMy3D — início">MAKE<span>MY</span>3D<span className="brand-dot">.</span></Link><nav aria-label="Navegação principal"><Link href="/#como-funciona">Como funciona</Link><Link href="/#projeto">O projeto</Link><Link className="nav-admin" href="/admin">Área de gestão <span aria-hidden="true">↗</span></Link></nav></header>;
}
export function SiteFooter() {
  return <footer className="site-footer"><p className="brand">MAKE<span>MY</span>3D.</p><p>Da ideia ao objeto. Camada a camada.</p><p className="muted">Demonstração local · Portugal · Sem pagamentos reais</p></footer>;
}
