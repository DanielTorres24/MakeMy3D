# Desenvolvimento local — Fundação da Fase 1

## Instalação e comandos

Ambiente validado: Windows, Node 24.16.0 e npm 11.13.0. Dependências fixadas no package-lock.json; executar `npm ci` na raiz (01_INSTALAR.bat faz o mesmo). Workspaces npm ligam apps/web à raiz. Não instalar Payload, PostgreSQL ou serviços externos nesta demo.

| Comando na raiz | Resultado |
| --- | --- |
| npm run dev | Servidor desenvolvimento em loopback |
| npm run build | Build Next para execução local |
| npm start | Servidor do build local |
| npm run seed | Cria seed somente se store.json não existe; valida dados existentes |
| npm run reset | Confirmação REPOR DEMO, backup e reposição |
| npm run lint | ESLint da aplicação |
| npm run typecheck | Geração de tipos de rotas e TypeScript strict |
| npm test | Vitest, incluindo persistência entre processos |
| npm run check | Lint, tipos, testes e build |

Os cinco .bat aceitam `--check` para validar configuração, mas isso não substitui um teste funcional. Os scripts de loja/admin aceitam `--no-browser`. O arranque aceita `--smoke` (verifica três rotas e encerra) e `--production`. Os dois scripts antigos 00_CLONAR/01_COPIAR foram adaptados para verificar esta raiz, sem operar uma segunda pasta.

## Configuração partilhada

Não é necessário criar um .env para usar os valores padrão. Para personalizar, copiar apps/web/.env.example para apps/web/.env.local. Variáveis do terminal prevalecem; em seguida .env.local e .env. Servidor, scripts Windows e CLI de dados usam o mesmo carregador scripts/env.mjs. Ficheiros .env.development, .env.production, .env.test e variantes .local são rejeitados, evitando que seed/reset operem num armazenamento diferente.

- PORT: 3000 por omissão; inteiro 1024–65535.
- MAKEMY3D_DATA_DIR: .data por omissão, relativo a apps/web; pode ser um caminho absoluto privado.
- Servidor sempre em 127.0.0.1. Não alterar para publicação pública nesta demo.

A build não precisa de dados nem de fontes remotas. As fontes usam fallback local; as cores e a composição reaproveitam a identidade original. A imagem geométrica é CSS original, sem imagens ou modelos de terceiros.

## Camadas e limites da fase

UI em src/app e src/components; schemas/entidades em src/domain; Route Handler /api/health chama serviço e contrato StoreRepository; JsonStoreRepository implementa o adaptador local. O singleton server-only evita instâncias duplicadas no hot reload. Schemas definem as entidades necessárias às próximas fases, mas a seed contém somente definições e coleções vazias: não há catálogo, encomendas ou clientes inventados.

As páginas / e /admin são a base responsiva e a indicação de funcionalidades futuras. /api/health devolve apenas status, application, mode e schemaVersion. Erros dão 503 sem caminhos/dados; o terminal regista apenas a classificação do erro. Não há endpoint público de escrita ou reset.

## Persistência

Um snapshot apps/web/.data/store.json contém schemaVersion, revision, updatedAt, settings e coleções. Zod valida leitura e escrita. Valores monetários usam cêntimos inteiros; IDs são UUIDs; datas ISO. Updates executam read-modify-write numa fila. Callbacks de update não podem chamar o próprio repositório, pois estão sob exclusão.

O adaptador cria .writer.lock com exclusão wx, PID e token aleatório; outra instância não pode abrir o armazenamento. A escrita usa temporário único na mesma pasta, sync e rename. Uma falha antes do rename preserva o snapshot anterior. Não equivale a um banco de dados distribuído; não usar vários servidores, discos de rede ou armazenamento efémero. Dados inválidos e versões de schema desconhecidas são recusados, não apagados.

Pasta public e symlinks de diretório/ficheiro de dados são recusados. Dados, backups, uploads, .env, node_modules e artefactos de testes/build são ignorados pelo Git. Ficheiros criados usam permissões restritivas onde suportadas; no Windows a proteção efetiva depende das ACL da pasta do utilizador.

## Encerramento e recuperação

scripts/server.mjs usa a API custom server do Next em Node para permitir encerramento controlado no Windows. Os wrappers enviam shutdown por IPC privado, sem endpoint HTTP. O servidor fecha ligações e Next; os handlers de saída libertam apenas o lock cujo token pertence à instância. Este custom server é destinado à demo local, não a output standalone ou alojamento serverless.

Se o terminal for terminado à força ou houver crash, pode sobrar um lock. Não o apagar automaticamente nem tentar contornar um processo ainda vivo. Parar todas as instâncias, verificar a pasta configurada e executar, na raiz:

```powershell
npm exec --workspace @makemy3d/web -- tsx scripts/data.ts recover-lock
```

A recuperação valida formato/token/PID, recusa PID ativo, pede `RECUPERAR LOCK`, revalida e preserva o ficheiro num nome de recuperação. Um PID reutilizado por outro processo também impede a recuperação automática: requer análise manual. A operação não modifica store.json.

Reset: parar o servidor e executar 04_REPOR_DEMO.bat. Confirmar `REPOR DEMO`. É criada uma cópia bruta store-backup-*.json, mesmo se o JSON original for inválido. Uploads e backups anteriores são preservados. O reset não executa limpeza recursiva nem elimina histórico de backups. Usar apenas dados fictícios nesta demo.

## Testes e retoma

Os testes usam pastas isoladas em work/tests, nunca a .data operacional. Incluem processos Node separados para validar restart e lock. O teste de falha de rename injeta erro de I/O para verificar que o conteúdo anterior permanece intacto. Testes dos fluxos de compras e gestão ainda não se aplicam; serão criados nas fases correspondentes.

Consultar phase-1-test-report.md para comandos efetivamente executados. O gate seguinte é APROVO FASE 2, exclusivamente após o fecho da Fase 1.
