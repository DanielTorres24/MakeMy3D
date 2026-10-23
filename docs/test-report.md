# Relatório de validação — 23/10/2026

- npm run check: lint, TypeScript, 40 testes Vitest em sete ficheiros e build Next passaram. Inclui React Testing Library para submissão/erro do formulário de personalização.
- node scripts/qa-api.mjs: 18 verificações HTTP passaram com dados isolados; catálogo → upload STL → carrinho → encomenda e orçamento → admin → estado → reinício → JSON/anexos preservados. Verifica CSRF, sessão, acesso indevido, preço injetado, consentimento e logout.
- Playwright/Chromium: dois testes passaram (desktop personalização/anexo/carrinho/checkout/admin/estado; mobile catálogo/orçamento). Sem erros JavaScript no fluxo desktop, sem overflow horizontal nos casos mobile.
- Revisão adicional do catálogo: 200 detalhes API, dez ilustrações, paginação completa sem duplicados, filtros, pesquisa com acentos, ordenação e parâmetros inválidos passaram. Produtos/categorias ocultos não aparecem e detalhes devolvem 404. Formulário real de pesquisa verificado; capturas desktop/mobile inspecionadas.
- npm audit --omit=dev: zero alertas. Auditoria completa conserva cinco alertas high na cadeia de lint já documentada na Fase 1. Não aplicado downgrade incompatível nem audit fix --force.
- git diff --check e preservação do index.html original verificados.

## Problemas corrigidos durante QA

Contrato history dos orçamentos, narrowing TypeScript no CRUD, limite incremental do corpo JSON administrativo e validação de slug. A comparação de origem foi corrigida para usar Host recebido (Next custom server normalizava request.url); o servidor restringe Host a localhost/127.0.0.1 e porta configurada. Os testes HTTP confirmaram mutações legítimas e rejeição de origem externa.

Playwright inicialmente não tinha Chromium compatível: instalado. Dois seletores foram corrigidos para o nome acessível real e o catálogo renderizado, evitando conflito transitório com a página de loading. A repetição passou. npm ci inicialmente encontrou EPERM num módulo nativo carregado pelo servidor de desenvolvimento antigo; o processo foi encerrado antes de repetir.

## Limites da evidência

Não é auditoria de segurança ou acessibilidade certificada. Sem teste de carga, múltiplas instâncias, pagamentos ou deploy. Os fluxos usam clientes fictícios e pastas novas em work; não repõem os dados da loja. Limites operacionais e de uploads em ARCHITECTURE.md. As capturas em evidence mostram apenas os estados testados.

## Reinstalação final

npm ci terminou com saída 0 (476 pacotes), após encerrar o processo que bloqueava o módulo nativo. npm audit completo repetido no fim devolveu zero vulnerabilidades; os cinco alertas anteriores são histórico da auditoria inicial, não o resultado final. Não foi usado audit fix --force. Esta verificação foi feita na pasta de trabalho com reinstalação pelo lockfile, não num segundo checkout independente.
