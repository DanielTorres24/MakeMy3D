@echo off
setlocal EnableExtensions
cd /d "%~dp0"
if not exist "AGENTS.md" (
  echo Nao foi encontrado AGENTS.md nesta pasta.
  exit /b 1
)
if not exist "docs\PROJECT_MASTER_CONTEXT.md" (
  echo Nao foi encontrado o contexto mestre em docs.
  exit /b 1
)
if not exist "docs\MAKEMY3D_WORKERS_APPROVAL_WORKFLOW.md" (
  echo Nao foi encontrado o workflow de aprovacao em docs.
  exit /b 1
)
echo O contexto ja se encontra na raiz deste projeto:
echo %CD%
echo Nao e necessario copiar ficheiros para outra pasta.
echo Consulte docs\WORK_PROGRESS.md para retomar a fase aprovada.
exit /b 0
