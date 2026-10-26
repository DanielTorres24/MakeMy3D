@echo off
setlocal EnableExtensions
cd /d "%~dp0"
if not exist ".git" (
  echo Esta pasta ainda nao contem o repositorio MakeMy3D.
  echo Consulte docs\implementation-plan.md antes de preparar uma copia Git.
  echo Nenhuma pasta externa foi criada ou modificada.
  exit /b 1
)
where git >nul 2>&1
if errorlevel 1 (
  echo Git nao encontrado. Instale Git for Windows para inspecionar o repositorio.
  exit /b 1
)
echo O repositorio ja esta preparado nesta pasta:
echo %CD%
git remote -v
if errorlevel 1 exit /b 1
echo Para instalar a aplicacao, execute 01_INSTALAR.bat.
exit /b 0
