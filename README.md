# MakeMy3D — Demonstração local

Fundação Next.js/React/TypeScript/Tailwind com persistência JSON privada, implementada na Fase 1. Interface em português de Portugal. O catálogo, compras, uploads e backoffice funcional serão implementados nas respetivas fases, após aprovação.

## Iniciar no Windows

1. Instalar Node.js 24 LTS (ambiente validado) e Git for Windows.
2. Executar `01_INSTALAR.bat` na raiz do projeto.
3. Executar `02_INICIAR_LOJA.bat` e manter o terminal aberto.
4. Abrir http://127.0.0.1:3000. `03_ABRIR_BACKOFFICE.bat` abre a página de preparação da área de gestão.
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
