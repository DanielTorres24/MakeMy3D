# MakeMy3D — Next.js + Payload CMS + PostgreSQL

Aplicação isolada em `apps/web`. O `index.html` da raiz mantém a publicação atual no GitHub Pages.

## Arranque local
Requisitos: Node.js compatível com a versão de Payload instalada, npm, PostgreSQL.
1. `cd apps/web`
2. `npm install`
3. `cp .env.example .env` e definir `DATABASE_URL` e `PAYLOAD_SECRET` seguro (não publicar segredos).
4. Criar a base de dados PostgreSQL indicada em `DATABASE_URL`.
5. `npm run dev`
6. Abrir `http://localhost:3000/admin` e criar o primeiro administrador.

**Aviso:** Esta branch é um scaffold inicial não validado em CI. Testar instalação, tipos, migrações e arranque local antes de fazer merge/deploy.
Nunca expor a API administrativa nem credenciais em produção sem rever permissões e mecanismos de autenticação. O acesso público às coleções de catálogo é de leitura; pedidos e encomendas são administrativos nesta fase.

## Módulos da fase 1
Users, Categories, Materials, Media, Products, Customers, Quotes, Orders, ProductionJobs.
Pedidos públicos de orçamento, uploads de CAD/STL, checkout, pagamentos, faturação, correio eletrónico e dashboard personalizado: fases seguintes.

## Planeamento
- Fase 1: estruturas de dados e backoffice autenticado.
- Fase 2: formulários públicos para orçamentos e ficheiros 3D com validação.
- Fase 3: carrinho, encomendas, pagamentos e integração com clientes.
- Fase 4: fila de produção, custos e automações.

A migração visual do `index.html` para componentes Next.js será feita depois da validação desta fundação.
