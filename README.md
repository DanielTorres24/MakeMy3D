# MakeMy3D — Demonstração local

Loja demonstrativa Next.js/React/TypeScript/Tailwind em português de Portugal, com 200 conceitos em dez categorias, personalização, uploads privados, carrinho, encomendas simuladas, orçamentos e backoffice sobre a mesma persistência JSON local.

## Iniciar no Windows

1. Instalar Node.js 24 LTS (ambiente validado) e Git for Windows.
2. Executar `01_INSTALAR.bat` na raiz do projeto.
3. Executar `02_INICIAR_LOJA.bat` e manter o terminal aberto.
4. Abrir http://127.0.0.1:3000. `03_ABRIR_BACKOFFICE.bat` abre o backoffice. Palavra-passe demonstrativa: `makemy3d-demo` (configurável em `MAKEMY3D_ADMIN_PASSWORD`).
5. Parar normalmente com Ctrl+C. Não executar várias instâncias contra a mesma pasta de dados.

`05_TESTAR.bat` executa lint, tipos, testes e build. `04_REPOR_DEMO.bat` pede a confirmação literal `REPOR DEMO` e cria um backup; parar primeiro o servidor.

Para testar o build local: `npm run build` seguido de `npm start`, ou `02_INICIAR_LOJA.bat --production`.

## Estrutura

- `apps/web`: aplicação, domínio, serviços, adaptador JSON, seeds e testes.
- `scripts`: arranque local, configuração partilhada e suporte Windows.
- `docs/LOCAL_DEVELOPMENT.md`: operação, arquitetura, dados, recuperação e limitações.
- `docs/WORK_PROGRESS.md`: fases autorizadas, resultados e próximo passo.
- `docs/phase-1-test-report.md`: evidências de validação desta fase.
- `index.html`: site original preservado; não é o entrypoint da nova aplicação.

Demo local, sem pagamentos ou autenticação de produção. GitHub Pages não executa o backend Node/JSON. Payload CMS e PostgreSQL continuam reservados para evolução futura.

## Catálogo e validação

Uma instalação nova recebe 200 entradas demonstrativas originais (160 objetos e 40 serviços). As ilustrações abstratas não representam modelos de impressão reais. Ver `docs/CATALOG_SOURCES.md`. Para acrescentar o catálogo a dados antigos: parar o servidor e executar `npm run catalog:seed`; o comando preserva edições e cria backup quando acrescenta entradas.

Após `npm run build`, `node scripts/qa-api.mjs` verifica a integração HTTP com dados isolados. `npx playwright test --config scripts/qa-playwright.config.mjs` verifica os fluxos no browser (instalar primeiro Chromium com `npx playwright install chromium`). Os testes não usam os dados operacionais da loja.

Uploads: STL, 3MF, PNG, JPG/JPEG e WebP, até 20 MiB por ficheiro, cinco por item e 30 por sessão. Ficheiros ficam fora de public e só podem ser descarregados pela sessão proprietária ou pelo administrador. Não existe preview/slicing nem garantia de imprimibilidade. As sessões administrativas expiram ao fim de duas horas ou quando o servidor reinicia.
