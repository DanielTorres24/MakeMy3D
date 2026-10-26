# Arquitetura e evolução

## Aplicação local

Next App Router apresenta páginas de catálogo no servidor e formulários interativos React. Route Handlers validam pedidos com Zod, encaminham para serviços e para JsonStoreRepository. O servidor escuta apenas 127.0.0.1. A loja e o backoffice partilham a mesma base JSON; não há pagamentos, emails ou autenticação de produção.

O repositório serializa alterações, valida o estado completo e grava um temporário antes do rename atómico. Um lock de processo impede escritores concorrentes. Não é uma base distribuída: exige um único processo e disco local persistente. Os dados mutáveis, anexos, backups e .env não entram no Git. Os pedidos conservam snapshots dos artigos e preços calculados no servidor.

A sessão de cliente usa um identificador aleatório num cookie HttpOnly/SameSite. Carrinhos e propriedade dos anexos persistem no JSON. A sessão administrativa usa tokens aleatórios, armazenados por hash em memória; reiniciar termina o login sem apagar negócio. Escritas verificam origem e dados; downloads privados usam attachment/nosniff. A palavra-passe por defeito é pública e exclusiva da demo.

## Limitações conhecidas

Não há expiração/limpeza automática dos carrinhos e anexos, quotas globais, proteção antivírus, recuperação de conta ou isolamento multiutilizador de produção. Os limites por sessão não impedem crescimento de disco através de novas sessões. Os uploads são validados quanto ao conteúdo/formato, não quanto à viabilidade de impressão. JSON inteiro é lido/validado e escrito nas mutações; o alvo é uma demonstração pequena. Os preços, dimensões e ilustrações são indicativos. Não existem modelos MakerWorld redistribuídos.

## Migração futura

Substituir o adaptador por PostgreSQL com transações/migrações e integrar Payload CMS mantendo os contratos dos serviços. Migrar IDs, relações, snapshots e histórico, verificando contagens e totais; testar em cópia antes do corte. Adotar autenticação real/RBAC, armazenamento privado de objetos, quotas, retenção, backups restauráveis e observabilidade. Pagamentos, impostos, faturação, transportes e deploy requerem requisitos e autorização próprios. GitHub Pages só serve o site estático original, não este backend.
