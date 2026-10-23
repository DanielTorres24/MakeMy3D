import AdminPanel from '@/components/admin-panel';
import './admin.css';
export const metadata = { title: 'Backoffice demonstrativo' };
export default function Admin() { return <main id="conteudo" className="admin-page"><p className="eyebrow">MAKEMY3D · GESTÃO LOCAL</p><h1>Backoffice <span>demo.</span></h1><p className="notice">Demonstração local: sem autenticação de produção, pagamentos ou envio de mensagens. A sessão expira após 2 horas e termina ao reiniciar o servidor.</p><AdminPanel /></main>; }
