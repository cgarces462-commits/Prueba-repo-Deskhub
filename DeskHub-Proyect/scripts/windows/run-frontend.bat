@echo off
rem ======================================
rem  DeskHub - arranque MANUAL del frontend
rem  Doble clic o ejecutar desde la terminal.
rem  Cierra la ventana para detener el servidor.
rem ======================================

cd /d "%~dp0..\..\frontend"
title DeskHub Frontend
npm run dev
pause