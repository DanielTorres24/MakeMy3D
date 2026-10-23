'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="simple-page" id="conteudo"><h1>Não foi possível abrir esta página.</h1><p>Tenta novamente. Se o problema continuar, consulta o terminal da aplicação.</p><button className="button" onClick={reset}>Tentar novamente</button></main>; }
