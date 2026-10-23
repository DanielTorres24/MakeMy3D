@echo off
setlocal EnableExtensions
where node >nul 2>&1
if errorlevel 1 (
 echo Node.js nao encontrado. Instale Node.js 24 LTS.
 exit /b 1
)
node "%~dp0scripts\windows.mjs" install %*
exit /b %errorlevel%
