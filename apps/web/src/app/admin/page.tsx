import Link from 'next/link';
export const metadata = { title: 'Área de gestão' };
export default function Admin() {
  return <main id="conteudo" className="simple-page"><p className="eyebrow">ÁREA DE GESTÃO</p><h1>O backoffice está<br /><span>em preparação.</span></h1><p>Na fase dedicada ao backoffice, esta área permitirá gerir o catálogo e acompanhar encomendas e pedidos de orçamento da demonstração.</p><div className="notice">Ainda não existe início de sessão nem acesso a dados administrativos. Esta aplicação é uma demonstração local e não deve ser publicada como uma loja de produção.</div><Link className="button" href="/">Voltar ao início <span aria-hidden="true">↗</span></Link></main>;
}
