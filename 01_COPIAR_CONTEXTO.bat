@echo off
setlocal EnableExtensions
set "SRC=%~dp0"
set "DEST=%USERPROFILE%\Projects\MakeMy3D"
if not exist "%DEST%\.git" (
 echo Nao foi encontrado um repositorio Git em "%DEST%".
 echo Execute 00_CLONAR_MAKEMY3D.bat ou copie manualmente estes ficheiros.
 pause
 exit /b 1
)
if not exist "%DEST%\docs" mkdir "%DEST%\docs"
for %%F in (AGENTS.md PROMPT_INICIAL_CODEX.md) do (
 if exist "%DEST%\%%F" (
  echo JA EXISTE: %%F - nao substituido.
 ) else (
  copy "%SRC%%%F" "%DEST%\%%F" >nul
  echo COPIADO: %%F
 )
)
for %%F in (PROJECT_MASTER_CONTEXT.md MAKEMY3D_WORKERS_APPROVAL_WORKFLOW.md) do (
 if exist "%DEST%\docs\%%F" (
  echo JA EXISTE: docs\%%F - nao substituido.
 ) else (
  copy "%SRC%docs\%%F" "%DEST%\docs\%%F" >nul
  echo COPIADO: docs\%%F
 )
)
echo.
echo Agora abra "%DEST%" no Codex Local.
pause
