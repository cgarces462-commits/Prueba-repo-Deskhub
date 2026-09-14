@echo off
rem ======================================
rem  Facturación EPM - arranque MANUAL del frontend
rem  Doble clic o ejecutar desde la terminal.
rem  Cierra la ventana para detener el servidor.
rem ======================================

cd /d "%~dp0frontend"
title Facturacion EPM - Frontend
npm run dev
pause