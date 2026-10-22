@echo off
setlocal
set "BASE=%USERPROFILE%\Projects"
if not exist "%BASE%" mkdir "%BASE%"
where git >nul 2>&1
if errorlevel 1 (
 echo Git nao encontrado. Instale Git for Windows antes de continuar.
 pause
 exit /b 1
)
if exist "%BASE%\MakeMy3D\.git" (
 echo Repositorio ja existe em "%BASE%\MakeMy3D". Nenhum ficheiro foi substituido.
) else (
 git clone https://github.com/danieltorres24/MakeMy3D.git "%BASE%\MakeMy3D"
 if errorlevel 1 (
   echo Falha ao clonar. Confirme acesso ao repositorio e a ligacao.
   pause
   exit /b 1
 )
)
echo.
echo Repositorio: "%BASE%\MakeMy3D"
echo Agora copie AGENTS.md e docs deste pacote para a raiz do repositorio.
echo Abra esta pasta no Codex e escolha Local.
explorer "%BASE%\MakeMy3D"
pause
