import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-shell';
import './globals.css';
export const metadata: Metadata = { title: { default: 'MakeMy3D — Da ideia ao objeto', template: '%s | MakeMy3D' }, description: 'Impressão e modelação 3D. Demonstração local MakeMy3D.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-PT"><body><a className="skip-link" href="#conteudo">Saltar para o conteúdo</a><div className="demo-strip">EM CONSTRUÇÃO <span aria-hidden="true">/</span> Demonstração local MakeMy3D</div><SiteHeader />{children}<SiteFooter /></body></html>;
}
