# MakeMy3D — Contexto Mestre do Projeto

> **Estado:** referência de requisitos aprovada para a primeira demonstração funcional  
> **Atualizado em:** 22 de outubro de 2026  
> **Idioma:** português de Portugal (pt-PT)  
> **Princípio:** este documento é a referência das decisões confirmadas; propostas futuras não substituem decisões sem indicação explícita do responsável pelo projeto.

## 1. Identidade e referências

- **Projeto:** MakeMy3D.
- **Objetivo:** plataforma de produtos impressos em 3D, produtos personalizáveis, impressão por encomenda e serviços de modelação/design 3D.
- **Mercado e idioma inicial:** Portugal; pt-PT; moeda EUR (€).
- **Repositório indicado:** https://github.com/danieltorres24/MakeMy3D
- **Site atual indicado:** https://danieltorres24.github.io/MakeMy3D/
- **Referência para descoberta de modelos:** https://makerworld.com/en/search/models
- **Abordagem:** reaproveitar e melhorar o projeto existente após auditoria; preservar a versão atual e trabalhar em branch dedicada.

## 2. Decisões finais confirmadas

| Tema | Decisão |
|---|---|
| Frontend | Next.js + React + TypeScript, interface responsiva |
| Backend demonstrativo | Node.js, de preferência integrado em Next.js via Route Handlers |
| Armazenamento inicial | Ficheiros JSON locais persistentes geridos pelo servidor, não LocalStorage como fonte principal |
| Backoffice inicial | Painel administrativo funcional de demonstração, com login simulado |
| Backoffice futuro | Payload CMS |
| Base de dados futura | PostgreSQL |
| Checkout | Simulação de compra e pedidos de orçamento; sem pagamentos reais |
| Personalização | Texto, cor, material, dimensões, quantidade, observações e carregamento de STL, 3MF e imagens |
| MakerWorld | Referências e dados demonstrativos; imagens apenas quando autorizadas, com fontes e licenças identificadas |
| GitHub | Desenvolvimento por fases, commits claros numa branch dedicada e Pull Request para revisão |

**Não implementar** pagamentos reais, autenticação de produção ou Payload/PostgreSQL como dependências obrigatórias na primeira demonstração.

## 3. Público, jornadas e funcionalidades

### Loja pública

- Página inicial com apresentação da MakeMy3D, categorias, produtos em destaque e serviços.
- Catálogo navegável, pesquisa, filtros e ordenação.
- Páginas de produto com preço indicativo, descrição, materiais, dimensões, imagens e variantes quando aplicáveis.
- Personalização de produto e anexos associados.
- Carrinho com quantidades, subtotal e personalizações preservadas.
- Checkout simulado que cria uma encomenda persistente com referência e confirmação, sem cobrar dinheiro.
- Pedido de orçamento independente para impressão ou modelação, com anexos.
- Experiência mobile-first, mensagens claras e estados de erro/carregamento/vazio.

### Backoffice demonstrativo (`/admin`)

- Login simulado e controlo de acesso às APIs administrativas (não apresentar como autenticação segura de produção).
- Dashboard com estatísticas derivadas dos dados efetivos.
- Gestão CRUD de produtos, categorias e respetiva visibilidade.
- Consulta e atualização de encomendas e orçamentos, incluindo estados, notas e anexos.
- Consulta de clientes/contactos associados a pedidos.
- Definições comerciais demonstrativas, sem inventar dados legais da empresa.
- Atualizações no backoffice refletidas na loja através da mesma API/persistência.

## 4. Categorias de catálogo

Objetivo indicativo: **cerca de 20 entradas por categoria, aproximadamente 200 entradas no total**, sem sacrificar licenciamento, qualidade ou coerência dos dados.

1. Casa e Organização
2. Personalizados
3. Peças de Substituição
4. Tecnologia e Acessórios
5. Decoração
6. Jogos e Hobbies
7. Soluções para Empresas
8. Eventos e Ofertas
9. Serviços de Impressão 3D
10. Modelação e Design 3D

Nas duas categorias de serviços, as entradas podem ser modalidades, pacotes ou ofertas de serviço, não objetos físicos. Os preços/dimensões apenas se aplicam quando fizerem sentido. Preços e prazos são indicativos e devem estar claramente identificados.

### Proveniência e direitos

- O MakerWorld é uma **referência de descoberta**, não uma autorização automática de revenda ou utilização de imagens.
- Guardar URL da fonte, autoria quando disponível e informação de licença/autorização, sem inventar direitos.
- Não usar modelos ou imagens comercialmente sem permissão aplicável; em dúvida, usar imagens próprias/autorizadas ou placeholders.
- Não fazer scraping que contorne condições ou mecanismos de proteção.

## 5. Arquitetura de referência

- **UI:** Next.js App Router, React, TypeScript, Tailwind CSS; componentes acessíveis e reutilizáveis.
- **Servidor:** Node.js com endpoints/Route Handlers Next.js, validação server-side (ex.: Zod).
- **Camadas:** UI → API → serviços → interfaces de repositório → armazenamento JSON.
- **Dados:** entidades Product, Category, Customization, CartItem, Customer, Order, OrderItem, Quote, Attachment, OrderStatusHistory e StoreSettings.
- **Integridade:** UUIDs, datas ISO, validação, escrita atómica e controlo de concorrência numa única instância de servidor.
- **Encomendas:** snapshot de preços, variantes e personalização no momento da submissão; recalcular preços no servidor.
- **Uploads:** STL, 3MF, PNG, JPG/JPEG e WebP; validar limites e conteúdos, guardar fora de `public`, proteger acesso e associação aos pedidos. Não executar modelos enviados.
- **Dados iniciais:** seeds versionados e comando explícito para repor; dados mutáveis e uploads ignorados pelo Git.
- **Sessões:** login simulado com sessão controlada pelo servidor e cookie HttpOnly; autorização dos endpoints administrativos. Uso estritamente demonstrativo.
- **Evolução:** trocar adaptadores JSON por PostgreSQL/Payload posteriormente, sem reescrever fluxos centrais.

**Limitação de alojamento:** a versão com Node.js e escrita em JSON requer ambiente de execução com filesystem persistente; GitHub Pages, por ser estático, não aloja este backend. Não fazer deploy público inseguro da demonstração com login simulado ou dados pessoais.

## 6. Regras de implementação para Work / Astra

1. Auditar repositório e site existente antes de alterar código.
2. Criar branch de trabalho, sugerida `feature/makemy3d-demo-fullstack`.
3. Reutilizar componentes/identidade visual existentes; não sobrescrever trabalho útil.
4. Priorizar fluxos completos e verificáveis, sem recriar um projeto vazio desnecessariamente.
5. Fases: auditoria → fundação → catálogo → personalização/carrinho/checkout/orçamentos → backoffice → integração/testes → documentação/PR.
6. Executar lint, verificação de tipos, testes e build; usar Vitest/React Testing Library e Playwright quando apropriado.
7. Fazer commits pequenos por funcionalidade e criar Pull Request; não fazer merge automático nem force push.
8. Não inventar testes passados, links, commits, licenças ou resultados.
9. Pedir confirmação apenas para ações irreversíveis, destrutivas, pagas ou publicação sensível.
10. Manter `docs/WORK_PROGRESS.md` com estado, decisões, testes, commits e próximo passo para retoma eficiente.

## 7. Critérios de aceitação prioritários

- Loja e backoffice arrancam localmente sem erros críticos.
- Dez categorias presentes e catálogo navegável (quantidade alcançada documentada).
- Pesquisa e filtros operacionais.
- Produto pode ser configurado e adicionado ao carrinho.
- Upload permitido/recusado de acordo com validação.
- Checkout simulado e pedido de orçamento criam registos persistentes.
- Pedidos aparecem no backoffice e os seus estados podem ser atualizados.
- Alterações de produtos refletem-se na loja.
- Dados continuam disponíveis após reinício do servidor.
- Testes fundamentais e build passam, ou falhas ficam explicitamente registadas.
- Documentação de setup, seeds, reset, arquitetura, limitações e futura migração disponível.
- Alterações numa branch com commits e PR, caso existam permissões.

## 8. Questões ainda não confirmadas (não bloquear desenvolvimento)

- Identidade visual detalhada (cores, fontes, logo final): derivar do repositório/site, sem inventar rebranding obrigatório.
- Dados legais, contactos definitivos, impostos e política comercial: usar placeholders claramente assinalados.
- Tarifas reais de impressão, envio e prazos de produção: utilizar valores indicativos identificados, não prometer condições reais.
- Plataforma de alojamento de produção, serviço de emails e fornecedores de pagamentos: adiar para fase posterior.
- Licenças de modelos e imagens específicos: validar individualmente antes de os incluir.

## 9. Prioridades pós-demonstração

1. Payload CMS + PostgreSQL e migração dos modelos JSON.
2. Autenticação real com permissões e gestão de utilizadores.
3. Armazenamento de ficheiros em serviço persistente apropriado.
4. Checkout real, faturação, transportes e pagamentos, depois de requisitos legais/comerciais aprovados.
5. Emails transacionais, observabilidade, backups, segurança e deploy em produção.

## 10. Como usar este documento

- Colocar em `docs/PROJECT_MASTER_CONTEXT.md` dentro do repositório.
- Dar a instrução ao Work: **"Lê `docs/PROJECT_MASTER_CONTEXT.md` antes de implementar; trata as decisões confirmadas como requisitos e atualiza `docs/WORK_PROGRESS.md` ao final de cada fase."**
- Em caso de conflito com prompts antigos, dar prioridade às **decisões finais confirmadas** neste documento, exceto se o responsável pelo projeto as alterar explicitamente.
- Este documento resume as decisões disponíveis no contexto de trabalho; rever contra o repositório e quaisquer artefactos adicionais fornecidos antes de assumir que contém todos os detalhes históricos.
