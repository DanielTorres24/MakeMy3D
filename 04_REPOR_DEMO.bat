@echo off
setlocal EnableExtensions
where node >nul 2>&1
if errorlevel 1 (
 echo Node.js nao encontrado.
 exit /b 1
)
node "%~dp0scripts\windows.mjs" reset %*
exit /b %errorlevel%
