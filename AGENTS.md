# MakeMy3D — Instruções permanentes para Codex local

## Documentos obrigatórios
Antes de qualquer alteração, ler `docs/PROJECT_MASTER_CONTEXT.md` e `docs/MAKEMY3D_WORKERS_APPROVAL_WORKFLOW.md`. Consultar `docs/WORK_PROGRESS.md`, se existir. As decisões aprovadas prevalecem sobre propostas.

## Aprovação humana obrigatória
- **Não iniciar nenhuma fase sem receber `APROVO FASE N`**, incluindo a Fase 0.
- Na primeira resposta: descrever brevemente a Fase 0 e pedir `APROVO FASE 0`; não alterar ficheiros antes disso.
- Executar somente a fase aprovada; após terminar, apresentar resultados, testes, ficheiros e commits, atualizar WORK_PROGRESS e parar até aprovação seguinte.
- `REVER FASE N` não autoriza avançar.
- Nunca fazer merge na main, deploy público, force push, despesas, alterações destrutivas ou autenticação/pagamentos reais sem autorização específica.

## Arquitetura e execução
- Site Next.js/React/TypeScript/Tailwind + Node.js (Route Handlers), demo em pt-PT.
- Persistência JSON de servidor, ficheiros fora de public, uma instância, com validação, escritas atómicas e seeds/reset seguro.
- Login apenas demonstrativo, uploads STL/3MF/imagens com validação, catálogo com fontes e direitos de imagens/modelos verificados.
- Backoffice /admin sincronizado com frontend; Payload CMS/PostgreSQL somente numa fase futura.
- Reutilizar o código existente; trabalhar em `feature/makemy3d-demo-fullstack`; testar e fazer commits por fase autorizada.
- Criar na Fase 1 os scripts Windows: `01_INSTALAR.bat`, `02_INICIAR_LOJA.bat`, `03_ABRIR_BACKOFFICE.bat`, `04_REPOR_DEMO.bat`, `05_TESTAR.bat`, com verificações e sem comandos destrutivos não confirmados.

## Fonte de verdade e progresso
Se as fontes entrarem em conflito, apresentar a divergência para decisão do utilizador; não inventar requisitos. Manter `docs/WORK_PROGRESS.md` atualizado. Não afirmar que comandos foram executados ou commits criados sem verificação.
