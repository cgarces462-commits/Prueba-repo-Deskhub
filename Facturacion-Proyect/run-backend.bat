@echo off
rem ======================================
rem  Facturación EPM - arranque MANUAL del backend
rem  Cierra la ventana para detener el servidor.
rem ======================================

cd /d "%~dp0Backend"
title Facturacion EPM - Backend
node index.js
pause