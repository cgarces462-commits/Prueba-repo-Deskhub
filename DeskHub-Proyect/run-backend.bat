@echo off
rem ======================================
rem  DeskHub - arranque MANUAL del backend
rem  Cierra la ventana para detener el servidor.
rem ======================================

cd /d "%~dp0Backend"
title DeskHub Backend
node index.js
pause