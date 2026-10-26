# Fase 7 — Design e usabilidade da demonstração

Data: 26/10/2026. Âmbito autorizado: melhorar experiência e testar a demo, sem produção, merge ou deploy.

## Decisões de design

Mantida a identidade escura e laranja. Títulos com escala mais equilibrada, texto corrente maior, campos a 16 px, botões de pelo menos 44–48 px e espaçamentos consistentes. Largura máxima reduzida para leitura confortável em monitores grandes; formulários com coluna limitada e campos de duas colunas quando existe espaço.

A navegação principal dá prioridade ao catálogo, serviços, orçamento e carrinho. A área de gestão passou para o rodapé. A homepage distingue duas entradas: escolher no catálogo ou descrever uma ideia. Os destaques surgem antes da lista completa de categorias. O processo descreve o que a demonstração realmente faz, e uma secção de perguntas frequentes explica materiais, ficheiros, preços e ausência de cobrança.

O catálogo tem uma introdução mais curta e categorias que se podem deslocar horizontalmente no telemóvel; o filtro de categoria também está disponível no formulário. Cartões, preços e notas ficaram mais legíveis. Os formulários explicam o que é opcional, a finalidade dos anexos e o que acontece ao enviar. A ligação de teclado para saltar ao conteúdo foi corrigida no carrinho, checkout e orçamento. O carrinho permite escrever a quantidade completa e confirmá-la com um botão, evitando pedidos a cada tecla.

Referências consultadas como princípios, sem copiar ativos ou conteúdos:
- https://www.apple.com/pt/airpods-pro/ — apresentação por benefícios e ação principal clara.
- https://www.ikea.com/pt/pt/cat/produtos-products/ — organização de catálogo por intenção/categoria.

## Validação

Lint, TypeScript, 40 testes Vitest/RTL e build passaram. A integração HTTP voltou a passar 18 verificações, incluindo encomenda/orçamento com anexos, controlo de acesso e preservação após reinício. npm audit --omit=dev: zero alertas.

A suite Playwright foi ampliada com sete páginas em quatro larguras (320, 390, 768 e 1440 px), ausência de overflow horizontal, navegação por teclado, pesquisa vazia/paginação, CRUD de categoria fictícia, alteração/validação/remoção de quantidades e recuperação de erro de API sem perder personalização. Axe verifica as sete páginas a 390 px para WCAG 2 A/AA e 2.1 AA. Resultados finais registados em WORK_PROGRESS.md.

Dados de teste em pastas isoladas work/qa-*. Dados operacionais e catálogo original preservados. Não foram instalados serviços de produção. A avaliação automática de acessibilidade não substitui uma auditoria manual completa, testes com leitores de ecrã ou testes com utilizadores reais. Não foram feitos testes de carga ou de dispositivos físicos.

## Continuação — Paleta e contexto (26/10/2026)

Pedido explícito do utilizador para rever cores/minimalismo usando outras lojas como referência. Implementada direção de atelier: branco quente #faf9f6, grafite #232522, cinzento neutro #62665e e terracota #b23c20 para ações. Paleta partilhada por loja, formulários e backoffice com variáveis semânticas. Reduzidos fundos escuros, grelhas decorativas, círculos, bordas de cartões e laranja em títulos secundários. Ilustrações SVG originais adaptadas a fundos claros, sem alterar modelos/dados operacionais.

Contexto da homepage: objetos para organizar, oferecer e resolver necessidades, com linguagem mais concreta. Referências consultadas: Apple Store PT (https://www.apple.com/pt/store), MUJI (https://www.muji.eu/) e IKEA PT (https://www.ikea.com/pt/pt/). As referências informam a direção; não foram copiados textos, fotos ou modelos.

Exportação opcional da homepage para HTML autónomo através de QA_EXPORT_DIR no teste de browser: estilos e ilustrações incorporados, sem scripts externos ou backend; navegação comercial aponta para a nota de pré-visualização. Permite avaliar o design sem iniciar o servidor.
