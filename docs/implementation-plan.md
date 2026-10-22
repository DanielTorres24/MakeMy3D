# MakeMy3D — Plano de implementação

## Fase 0 e evidência de origem

Auditoria autorizada por `APROVO FASE 0`, em 22/10/2026. As fases 1–6 não estão autorizadas.
Raiz escolhida pelo utilizador: `C:\Users\DanielTorres\Documents\AI\MakeMy3D_Codex_Complete`.
A pasta continha oito ficheiros de contexto/scripts e nenhum `.git` ou código. Foi obtida uma cópia integral do GitHub e adicionada à pasta sem sobrescrever os ficheiros fornecidos. A cópia alternativa em `%USERPROFILE%\Projects\MakeMy3D` não foi modificada; nela `git status` devolveu erro de work tree, apesar de o remote apontar para o projeto.

- Origin: https://github.com/danieltorres24/MakeMy3D.git
- Main inicial: `35a44142f7bdb867a3744f3c1b45306407cf7b6d`, um ficheiro `index.html`.
- Branch histórica: `feature/payload-backoffice-phase-1`, HEAD `e698ce8`, 16 ficheiros adicionais em `apps/web`, 16 commits após main.
- Site de referência: https://danieltorres24.github.io/MakeMy3D/ — HTTP 200 e HTML igual ao index versionado, após normalização de fins de linha.
- Ambiente observado: Git 2.49.0.windows.1, Node 24.16.0, npm 11.13.0. GitHub CLI indisponível no PATH. A compatibilidade das dependências será validada na Fase 1.

Foram lidos integralmente AGENTS.md, PROJECT_MASTER_CONTEXT.md, MAKEMY3D_WORKERS_APPROVAL_WORKFLOW.md, WORK_PROGRESS_TEMPLATE.md, LEIA-ME_PRIMEIRO.md e PROMPT_INICIAL_CODEX.md, além dos scripts de preparação. O Worker 0 executou auditoria adicional do HTML e de todos os ficheiros da branch Payload.

## Diagnóstico e reaproveitamento

| Área | Existe | Trabalho necessário |
| --- | --- | --- |
| Identidade | Fundo #0d0d0f, destaque #ff5c35, cartões, hero, logo tipográfico | Migrar tokens e composição para componentes React acessíveis |
| Tipografia | Bebas Neue, DM Sans, JetBrains Mono via Google Fonts | Rever licença antes de distribuir fontes; garantir fallback e arranque sem dependência de rede |
| Conteúdo | pt/en/es, processo em quatro passos, vantagens e testemunhos | Demo em pt-PT; não perpetuar testemunhos, números, contactos ou prazos não comprovados como factos |
| Catálogo | Seis exemplos ilustrados por emoji e quatro grupos | Dez categorias, produtos e serviços, preços indicativos, pesquisa, filtros reais, ordenação, detalhe |
| Formulário | Campos visuais e seletor de ficheiros | Sem elemento form e sem submissão; implementar validação e persistência |
| Upload | Seleção visual, texto promete formatos/50 MB | Não existe transporte nem validação; requisitos finais STL/3MF/PNG/JPG/JPEG/WebP prevalecem sobre texto antigo OBJ/PDF |
| Filtros | Alteram classe active | Não filtram produtos |
| Compras | Não existe | Carrinho, preços servidor, encomendas e orçamento simulado |
| Backoffice | Scaffold numa branch separada | Implementar /admin com sessão demonstrativa e API autorizada |
| Dados | Nenhuma persistência | Repositórios JSON no servidor e anexos privados |
| QA | Sem package.json/testes/build na main | Configurar e executar validações por fase |
| Licenças | Sem manifesto de fontes/modelos | Rastrear fonte, autoria, licença, autorização e natureza demonstrativa de cada ativo |

Reutilizar a identidade, a estrutura editorial, as ideias dos seis exemplos, os campos pertinentes e os conceitos de domínio da branch antiga. O HTML original permanece intacto nesta fase e será conservado na raiz como referência. Não copiar manipulação direta do DOM nem innerHTML para conteúdo de clientes.

A branch Payload contém Next/React, coleções Users/Categories/Materials/Media/Products/Customers/Quotes/Orders/ProductionJobs e rotas administrativas. É um scaffold que o próprio README identifica como não validado; não tem lockfile ou testes. Payload/PostgreSQL e autenticação real são incompatíveis com o âmbito atual. Preservar a branch; adaptar conceitos de entidades, sem integrar as dependências nem a branch inteira. ProductionJobs e multilinguismo não são requisitos desta demo.

## Decisões de arquitetura

1. Um único repositório e uma aplicação Next.js em `apps/web`, com App Router, React, TypeScript strict e Tailwind. UI e backend integrados dispensam dois serviços, CORS e duplicação de contratos. Não é necessário criar repositórios adicionais.
2. `src/app/(store)` e `src/app/admin` para interfaces; `src/app/api` para Route Handlers Node; `src/components` para UI; `src/domain` para entidades, schemas e contratos; `src/server/services` para regras; `src/server/repositories` para interfaces e adaptador JSON. Código de filesystem exclusivamente server-side.
3. Persistência proposta em `apps/web/.data/store.json` com schemaVersion e coleções num único snapshot, fora de public e ignorado por Git. Um processo servidor, fila de escrita serializada, atualização read-modify-write sob exclusão, validação Zod, ficheiro temporário na mesma pasta e rename atómico. Bloqueio de segunda instância escritora. Dados inválidos não devem ser silenciosamente repostos. Validar comportamento Windows e falhas de escrita.
4. Seeds fictícios versionados separados dos dados mutáveis. Seed inicial só quando não existem dados. Reset explícito e confirmado, com cópia de segurança e restrição à pasta de dados; servidor parado durante reposição. Nenhum reset automático no arranque.
5. Entidades: Product, Category, Customization, CartItem, Customer, Order, OrderItem, Quote, Attachment, OrderStatusHistory, StoreSettings. UUIDs e datas ISO; valores monetários em cêntimos inteiros. Produtos físicos e serviços distinguidos. Clientes derivados de pedidos, sem contas reais.
6. APIs públicas de catálogo só devolvem produtos ativos e campos públicos. Compras calculadas no servidor a partir do catálogo; snapshots de descrição, preços e personalizações. Idempotência de submissão a definir/testar na Fase 3. Cache deve permitir refletir alterações administrativas imediatamente.
7. Carrinho pode ter conveniência no navegador, mas encomendas/orçamentos são fonte de verdade no servidor. Não persistir dados pessoais no navegador desnecessariamente. Confirmações identificam explicitamente ausência de pagamento.
8. Uploads em `apps/web/.data/uploads`, nomes UUID, sem servir caminhos arbitrários. Validar extensão, conteúdo, tamanho e associação ao pedido/sessão. Proposta inicial: 20 MiB por ficheiro, cinco anexos por pedido, limite total de 50 MiB; valores configuráveis e visíveis na UI. Para 3MF validar ZIP/XML com limites de descompressão e proteção contra path traversal, entidades externas e ZIP bombs. Não executar modelos. Downloads privados autorizados, sem confiar em IDs conhecidos como prova de acesso.
9. Sessão demo no servidor com cookie HttpOnly, SameSite, expiração e autorização em todas as APIs administrativas. Proteção de origem/CSRF nas mutações, validação de entrada e limites de pedidos. Inicialização apenas em loopback. Não tratar login demo como segurança de produção.
10. Nenhum email, pagamento, dado legal ou tarifa real inventado. Aproximadamente 200 entradas só se credíveis e com ativos autorizados; imagens originais/ilustrações claramente demonstrativas são alternativa. Não recolher modelos MakerWorld sem direitos verificados.
11. GitHub Pages mantém apenas a referência estática. Node e JSON requerem filesystem persistente e não funcionam como backend em Pages. Sem deploy nesta execução.
12. Futura troca do adaptador JSON por PostgreSQL/Payload através das interfaces de repositório; não instalar essas dependências agora.

## Branches e integração

- `main`: preservada; sem merge ou push direto.
- `feature/makemy3d-demo-fullstack`: branch de integração e destino dos commits aprovados, conforme AGENTS.md.
- `phase/0-audit`: marco da auditoria após commit.
- `frontend/makemy3d-demo` e `backend/makemy3d-demo`: referências iniciais de trabalho por área, criadas na preparação. A existência destas branches não autoriza implementação.
- Em cada fase aprovada, criar branches curtas `phase/N-<tema>` e, quando houver divisão real de trabalho, `frontend/phase-N-<tema>` e `backend/phase-N-<tema>` a partir do último commit integrado. Não criar código ou commits de fases futuras antecipadamente.
- Contratos partilhados e lockfile são responsabilidade do worker da fase; nunca dois workers a editar os mesmos ficheiros. Preferir integração fast-forward quando possível, ou commits selecionados e revistos na branch principal de desenvolvimento, sem duplicar trabalho.
- Commit descritivo por incremento validado. Push apenas para branches de trabalho verificadas. PR final na Fase 6 para main, sem merge. A preparação atual não exige PR prematuro.
- Preservar integralmente `feature/payload-backoffice-phase-1`.

## Sete workers, fases e aceitação

| Fase / worker | Âmbito e entregáveis | Critérios e testes de saída |
| --- | --- | --- |
| 0 — Auditor / Arquiteto | Inventário, diagnóstico, plano, estratégia Git e WORK_PROGRESS | Origem e histórico confirmados; plano fundamentado, riscos e alojamento esclarecidos |
| 1 — Fundação Full-Stack | apps/web, contratos, JSON, seed/reset, UI base e cinco .bat na raiz | Instalação, dev, lint, typecheck, build; leitura/escrita, concorrência, erros, reinício e reset seguro; testar .bat no Windows |
| 2 — Catálogo / Conteúdos / UX | Dez categorias, seed, manifesto de direitos, homepage/listagem/detalhe | Pesquisa, filtros, ordenação, ativos/inativos, imagens, ligações e viewport móvel; quantidade e fontes documentadas |
| 3 — Personalização / Compras / Uploads | Configuração, anexos, carrinho, checkout e orçamento | Preços recalculados, quantidades e inputs inválidos rejeitados, anexos autorizados, limites/formatos, referências e persistência após restart |
| 4 — Backoffice / Integração | Sessão demo, métricas, CRUD, estados/notas, clientes e definições | Acesso anónimo negado, CRUD refletido na loja, pedidos visíveis, histórico e dados preservados após restart |
| 5 — QA / Segurança / Performance | Vitest, React Testing Library, Playwright, acessibilidade e relatório | Fluxo loja→pedido→admin→estado→restart; build e regressão; casos negativos, mobile, teclado, estados vazios/erro; falhas reais registadas |
| 6 — GitHub / Documentação / Entrega | README, operação, migração futura, revisão de segredos/diffs, push e PR | Checkout limpo, instalação, build, regressão e scripts; links de branch/commits/PR verificados, sem merge |

Apenas o Worker 0 é iniciado nesta fase. Os restantes são ativados sequencialmente mediante aprovação explícita da respetiva fase. A aprovação não é herdada nem substituída pela criação de branches.

## Scripts Windows previstos para a Fase 1

`01_INSTALAR.bat`, `02_INICIAR_LOJA.bat`, `03_ABRIR_BACKOFFICE.bat`, `04_REPOR_DEMO.bat`, `05_TESTAR.bat`. Usar `%~dp0`, caminhos com espaços, `call npm`, verificações de Git/Node/npm, códigos de saída e mensagens claras. Instalação reprodutível com lockfile; browser abre apenas quando servidor estiver disponível. Reset pede confirmação e preserva backup.

Os scripts fornecidos `00_CLONAR_MAKEMY3D.bat` e `01_COPIAR_CONTEXTO.bat` apontam para `%USERPROFILE%\Projects\MakeMy3D`, não para a raiz escolhida. Foram preservados e não executados. Não são os scripts operacionais da nova demo; rever na Fase 1 para evitar dirigir trabalho à pasta errada.

## Riscos e decisões pendentes não bloqueantes

- Direitos de imagens/modelos e veracidade dos testemunhos/números atuais não comprovados; não os publicar como factos.
- Persistência local restringida a uma instância; disco cheio, crash e Windows rename/antivírus exigem testes.
- Uploads 3MF são arquivos comprimidos e exigem validação de conteúdo, não apenas MIME.
- Os pacotes serão escolhidos e fixados após verificar compatibilidade na Fase 1; versões do scaffold não equivalem a instalação validada.
- GitHub CLI ausente; Git e credenciais de push serão verificados separadamente. PR pode ser criado pelo conector GitHub na fase de entrega.
- Inspeção atual do site é de HTTP/código, não uma validação visual em browser nem de acessibilidade.

## Próxima fase proposta

Fase 1: preparar fundação executável em apps/web, preservando index.html; instalar dependências; definir contratos e adaptador JSON seguro; criar e testar scripts .bat; verificar lint, tipos, build, persistência, concorrência, erros e reposição. Riscos: compatibilidade Node/pacotes, filesystem Windows e reposição de dados. Requer `APROVO FASE 1` antes de qualquer implementação.

## Observações adicionais do Worker 0

Os labels e amostras de cor atuais precisam de controlos acessíveis e associação explícita aos inputs. A zona de upload anuncia drag-and-drop sem o implementar. Na branch Payload, a leitura pública de Products não filtra published=false e a função admins só confirma a coleção users, ignorando role. Totais e preços de encomendas são campos editáveis sem recomputação em serviço. Estes comportamentos não serão copiados para a demo. Não existe LICENSE geral no repositório; não atribuir uma licença ao código sem decisão do titular.
