const steps = [
  ['01', 'A tua ideia', 'Uma peça útil, uma oferta pessoal ou algo que ainda não existe.'],
  ['02', 'À tua medida', 'Forma, material e cor pensados para o teu projeto.'],
  ['03', 'Camada a camada', 'A impressão 3D dá forma ao desenho digital.'],
  ['04', 'Um novo objeto', 'Da primeira ideia a uma peça que podes ter nas mãos.'],
];
export default function Home() {
  return <main id="conteudo">
    <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow"><span className="status-dot" /> IDEIAS COM VOLUME</p><h1 id="hero-title">IMAGINA.<br />PERSONALIZA.<br /><span>TORNA REAL.</span></h1><p className="intro">Pequenas soluções. Grandes ideias. Um novo espaço para descobrir o que a impressão 3D pode criar contigo.</p><a className="button" href="#como-funciona">Conhecer o processo <span aria-hidden="true">↘</span></a><p className="hero-note">Estamos a preparar a nova experiência MakeMy3D.</p></div><div className="hero-visual" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="model"><div className="model-top" /><div className="model-front" /><div className="model-side" /></div><div className="visual-label"><span>IDEIA → OBJETO</span><span>IMPRESSÃO 3D</span></div><div className="visual-corner">+<br />+</div></div></section>
    <section className="process section" id="como-funciona" aria-labelledby="process-title"><div className="section-heading"><div><p className="eyebrow">O PROCESSO</p><h2 id="process-title">Tudo começa com<br />uma ideia tua.</h2></div><p>Uma forma de pensar, experimentar<br />e criar em três dimensões.</p></div><div className="step-grid">{steps.map(([number, title, description]) => <article className="step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="project-panel section" id="projeto" aria-labelledby="project-title"><div><p className="eyebrow">PRÓXIMA CAMADA</p><h2 id="project-title">Um espaço para<br />as tuas possibilidades.</h2></div><div><p>Estamos a construir a loja MakeMy3D, com produtos, personalização e pedidos de impressão e modelação.</p><p className="muted">Esta é uma pré-visualização local. O catálogo, as compras e os pedidos de orçamento ainda não estão disponíveis.</p><span className="coming-soon">Em preparação <span aria-hidden="true">↗</span></span></div></section>
  </main>;
}
