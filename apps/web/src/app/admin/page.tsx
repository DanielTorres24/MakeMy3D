import AdminPanel from '@/components/admin-panel';
import './admin.css';
export const metadata = { title: 'Backoffice demonstrativo' };
export default function Admin() { return <main id="conteudo" className="admin-page"><p className="eyebrow">MAKEMY3D · GESTÃO LOCAL</p><h1>Área de <span>gestão.</span></h1><p className="notice">Gere o catálogo e acompanha os pedidos de teste. As alterações ficam visíveis na loja. Esta sessão de demonstração dura até 2 horas e termina ao reiniciar a aplicação.</p><AdminPanel /></main>; }
