@echo off
setlocal EnableExtensions
where node >nul 2>&1
if errorlevel 1 (
 echo Node.js nao encontrado. Execute 01_INSTALAR.bat apos instalar Node.js.
 exit /b 1
)
node "%~dp0scripts\windows.mjs" start %*
exit /b %errorlevel%
