# MakeMy3D → Codex Local (Windows)

Este pacote contém **contexto e instruções**, não substitui o código do repositório GitHub.

## Preparar

1. Instalar Git for Windows, Node.js LTS e Codex (aplicação ChatGPT para computador ou Codex CLI), se ainda não disponíveis.
2. Extrair este ZIP.
3. Executar `00_CLONAR_MAKEMY3D.bat` para clonar em `%USERPROFILE%\Projects\MakeMy3D`; se já existir, não sobrescreve.
4. Copiar `AGENTS.md`, `PROMPT_INICIAL_CODEX.md` e `docs/` para a **raiz da cópia local do repositório**. Rever conflitos antes de substituir ficheiros existentes. Alternativamente executar `01_COPIAR_CONTEXTO.bat`, que evita sobrescrever ficheiros existentes.
5. Abrir a pasta local MakeMy3D no Codex, selecionar execução **Local** e enviar o conteúdo de `PROMPT_INICIAL_CODEX.md` como instrução inicial.
6. O Codex deve pedir `APROVO FASE 0`. Só depois dessa resposta começa a análise. Repetir aprovação no início de cada nova fase.

## Git

- Repositório de destino: https://github.com/danieltorres24/MakeMy3D
- Branch de trabalho: `feature/makemy3d-demo-fullstack`
- Nunca fazer merge na branch principal, push forçado, ou publicar dados de clientes.
- Certifica-te de que estás autenticado para push (`git`/Git Credential Manager ou `gh auth login`, conforme configuração).

## Notas

- GitHub Pages é estático: o servidor Node.js com ficheiros JSON persistentes funciona **localmente**, mas não diretamente naquele alojamento.
- A autenticação é apenas demonstrativa, pelo que não deves publicar uma instância administrativa com dados reais.
- O Codex local não herda necessariamente os chats deste projeto; estes documentos servem para transmitir as decisões.
