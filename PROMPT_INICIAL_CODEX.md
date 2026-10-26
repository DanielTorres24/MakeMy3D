# Prompt de arranque — Codex Local (MakeMy3D)

Estou a trabalhar no projeto **MakeMy3D**, já existente no GitHub em `https://github.com/danieltorres24/MakeMy3D` e publicado como site de referência em `https://danieltorres24.github.io/MakeMy3D/`.

**Objetivo:** implementar localmente no Windows uma demonstração full-stack, gerar código funcional, executar testes e fazer commits/push **na branch de desenvolvimento do repositório atual**, nunca num repositório novo nem diretamente na branch principal.

**Lê antes de começar:**
1. `AGENTS.md` (instruções permanentes)
2. `docs/PROJECT_MASTER_CONTEXT.md` (decisões e âmbito)
3. `docs/MAKEMY3D_WORKERS_APPROVAL_WORKFLOW.md` (workers, fases e aprovação)
4. `docs/WORK_PROGRESS.md` (se existir, para retoma)
5. Código, branches, `git status` e configuração do repositório local (quando a Fase 0 for autorizada).

## Contexto essencial

- Frontend: Next.js App Router + React + TypeScript + Tailwind, interface em pt-PT e euros.
- Backend: Node.js através de Next.js Route Handlers, com armazenamento persistente em ficheiros JSON **no computador local**, fora de `public`, com seeds, validação e escritas seguras.
- Não usar PostgreSQL, Payload CMS nem pagamentos reais nesta versão; preparar migração futura.
- Loja com dez categorias e objetivo de aproximadamente 20 entradas por categoria, sem inventar permissões de utilização de imagens/modelos MakerWorld. Fontes e licenças identificadas. Serviços podem ser entradas demonstrativas.
- Produtos personalizáveis (texto, cor, material, dimensão, quantidade), uploads STL/3MF/imagens, carrinho, checkout simulado e pedidos de orçamento.
- Backoffice `/admin` com login demonstrativo, dashboard, gestão de produtos, categorias, pedidos, orçamentos, anexos, clientes e definições. Pedidos e alterações refletem-se entre loja e backoffice porque usam o mesmo servidor JSON.
- Criar ficheiros `.bat` para instalar, iniciar loja, abrir backoffice, repor dados demo e testar. Testar os próprios `.bat` no Windows, quando possível.
- QA: lint, typecheck, build, testes unitários/integrados e Playwright end-to-end. Registar testes efetivamente executados e falhas.

## Política Git

1. Confirmar que `git remote -v` aponta para `danieltorres24/MakeMy3D`. Se o remote divergir, **parar antes de qualquer push e pedir esclarecimento**.
2. Inspecionar `git status`; preservar quaisquer alterações existentes e não as eliminar.
3. Criar ou reutilizar com segurança a branch `feature/makemy3d-demo-fullstack`, sem sobrescrever branches existentes.
4. Fazer commits pequenos e descritivos por fase, depois de testar. Não incluir `node_modules`, `.env`, JSON mutável, uploads nem dados privados.
5. Depois dos testes, fazer push para `origin` da branch aprovada, quando existirem permissões. Não fazer `force push`, `merge` nem `deploy` sem autorização própria.
6. Criar/atualizar Pull Request para revisão se possível, sem o fundir. Se faltar GitHub CLI/autenticação, explicar o comando manual exato em vez de alegar sucesso.

## Aprovação humana: regra obrigatória

**NÃO INICIAR NENHUMA FASE sem eu escrever `APROVO FASE N`, incluindo Fase 0.** Trabalhar apenas na fase autorizada; dentro dela podes criar código, executar comandos, instalar dependências necessárias com as permissões disponíveis, testar e fazer commits/push da branch, sem pedir autorização para cada alteração trivial. No final, mostrar alterações, evidências, testes e commits, atualizar `docs/WORK_PROGRESS.md` e **PARAR**. A aprovação da fase N não aprova a fase N+1. Se eu escrever `REVER FASE N`, corrige/reavalia apenas essa fase.

### Sequência de fases

- **Fase 0 — Auditoria:** inspeção do repositório/site e plano de arquitetura, sem migração destrutiva.
- **Fase 1 — Fundação:** Next.js, camadas de domínio/API/JSON, ambiente local e scripts Windows.
- **Fase 2 — Catálogo:** categorias, produtos/serviços, imagens licenciadas, homepage, pesquisa e filtros.
- **Fase 3 — Personalização:** uploads, carrinho, checkout simulado e pedidos de orçamento.
- **Fase 4 — Backoffice:** login simulado, dashboard, CRUD, gestão de estados e integração.
- **Fase 5 — Qualidade:** segurança básica, QA automatizada, acessibilidade, testes e correções.
- **Fase 6 — Entrega:** documentação, validação final, commits/push, PR e guia de operação.

**O teu primeiro output agora deve ser apenas**: confirmar os documentos lidos (sem inventar), apresentar resumidamente o objetivo e riscos da Fase 0 e perguntar literalmente:

`Autorizas iniciar a Fase 0 — Auditoria e Arquitetura? Responde: APROVO FASE 0.`

Não alterar ficheiros nem executar comandos de modificação antes da minha autorização.
