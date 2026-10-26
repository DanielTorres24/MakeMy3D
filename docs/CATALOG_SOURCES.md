# Catálogo — fontes e direitos

Versão catalog-demo-2026-10-v1. 200 entradas: 160 conceitos de objetos e40 serviços,20 por cada uma das dez categorias aprovadas. Fonte de verdade e manifesto por entrada: apps/web/src/server/seeds/catalog-data.json (ID, nome, autor, rights, licenceNote, image, imageAlt, priceNote e dimensionsNote).

Todos os textos e SVG em apps/web/public/catalog foram criados para esta demonstração. As dez ilustrações abstratas são partilhadas por categoria e identificadas como ilustrações, não fotografias ou representação da geometria final. sourceUrl é null porque não existe fonte externa. Nenhum modelo STL/3MF, imagem MakerWorld, logótipo de terceiros ou franquia foi importado. Não é atribuída licença de terceiros nem licença geral ao repositório.

Preços fictícios e dimensões de referência são identificados em cada entrada e interface. Objetos são conceitos não produzidos/verificados; serviços descrevem possibilidades com âmbito a confirmar. As categorias de peças referem apenas usos não críticos e compatibilidade a confirmar. Não existem promessas de entrega, certificação ou disponibilidade real.

Novas instalações recebem a seed. Dados existentes são preservados: com servidor parado, npm run catalog:seed acrescenta entradas em falta sob lock, cria backup antes de alterar e preserva edições/inativos. Repetir sem entradas novas não altera bytes/revisão. Colisões de slug com outro ID abortam antes de escrever. Repor toda a demo continua a exigir REPOR DEMO e backup.
