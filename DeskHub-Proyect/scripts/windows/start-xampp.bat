@echo off
setlocal enabledelayedexpansion

rem ======================================
rem  DeskHub - arranque en Windows (XAMPP)
rem  Requiere: Node.js y XAMPP instalados
rem  Ubicaciones típicas: C:\xampp  o  D:\xampp
rem ======================================

set "DIR_SCRIPT=%~dp0"
rem scripts\windows -> subimos dos niveles hasta la raiz del proyecto
set "RAIZ=%DIR_SCRIPT%..\"
set "BACKEND=%RAIZ%Backend"
set "FRONTEND=%RAIZ%frontend"

rem Puerto del MySQL/MariaDB de XAMPP (lo normal es 3306)
set "PORT_DB=3306"

echo ======================================
echo  DeskHub - arranque con XAMPP
echo ======================================

rem ---------- 1) Detectar XAMPP ----------
set "XAMPP="
for %%d in (C:\xampp D:\xampp "%ProgramFiles%\xampp" "%ProgramFiles(x86)%\xampp") do (
    if not defined XAMPP if exist "%%~d\xampp-control.exe" set "XAMPP=%%~d"
)
if not defined XAMPP (
    echo [ERROR] No se pudo localizar XAMPP ^(carpeta con xampp-control.exe^).
    echo         Verifica su ubicacion y edita la lista de rutas al inicio
    echo         del script ^(variable XAMPP^).
    exit /b 1
)
echo [OK]  XAMPP encontrado en: %XAMPP%

rem Buscar los binarios de MySQL/MariaDB dentro de XAMPP
set "MYSQL_BIN="
if exist "%XAMPP%\mysql\bin\mysqladmin.exe" set "MYSQL_BIN=%XAMPP%\mysql\bin"
if not defined MYSQL_BIN if exist "%XAMPP%\mariadb\bin\mysqladmin.exe" set "MYSQL_BIN=%XAMPP%\mariadb\bin"
if not defined MYSQL_BIN (
    echo [ERROR] No se encontro MySQL/MariaDB en %XAMPP%\mysql ^(o %XAMPP%\mariadb^).
    echo         Revisa que XAMPP este instalado correctamente.
    exit /b 1
)
echo [OK]  MySQL de XAMPP: %MYSQL_BIN%

rem ---------- 2) Arrancar MySQL de XAMPP ----------
"%MYSQL_BIN%\mysqladmin.exe" -h 127.0.0.1 -P %PORT_DB% -u root ping >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  MySQL de XAMPP ya esta corriendo ^(puerto %PORT_DB%^)
) else (
    echo [..]  Iniciando MySQL de XAMPP...
    set "SVC="
    for %%s in (mysql MariaDB) do (
        if not defined SVC (
            sc query %%s >nul 2>&1 && set "SVC=%%s"
        )
    )
    if defined SVC (
        echo [..]  Con servicio de Windows: !SVC!
        sc start !SVC! >nul 2>&1
    ) else (
        echo [..]  Lanzando mysqld directamente...
        if exist "%MYSQL_BIN%\my.ini" (
            start "XAMPP MySQL" /min "%MYSQL_BIN%\mysqld.exe" --defaults-file="%MYSQL_BIN%\my.ini"
        ) else (
            start "XAMPP MySQL" /min "%MYSQL_BIN%\mysqld.exe"
        )
    )
    set "INTENTO=0"
    :espera_mysql
    "%MYSQL_BIN%\mysqladmin.exe" -h 127.0.0.1 -P %PORT_DB% -u root ping >nul 2>&1
    if %errorlevel%==0 goto mysql_ok
    set /a INTENTO+=1
    if !INTENTO! GEQ 30 (
        echo [ERROR] No se pudo iniciar MySQL de XAMPP.
        echo         Abre XAMPP Control Panel y pulsa Start en "MySQL".
        exit /b 1
    )
    timeout /t 1 >nul
    goto espera_mysql
)

:mysql_ok
"%MYSQL_BIN%\mysql.exe" -h 127.0.0.1 -P %PORT_DB% -u root -e "CREATE DATABASE IF NOT EXISTS deskhub" >nul 2>&1
echo [OK]  Base de datos 'deskhub' asegurada

rem ---------- 3) Backend\.env ----------
rem Si existe pero apunta al puerto viejo (3307), se regenera
findstr /i "DB_PORT=3307" "%BACKEND%\.env" >nul 2>&1 && goto crear_env
if exist "%BACKEND%\.env" goto env_listo
:crear_env
echo [..]  Creando Backend\.env
(
echo PORT=3000
echo DB_HOST=127.0.0.1
echo DB_PORT=%PORT_DB%
echo DB_NAME=deskhub
echo DB_USER=root
echo DB_PASSWORD=
echo JWT_SECRET=cambia_esta_clave_por_una_segura
echo JWT_EXPIRES_IN=8h
echo CORS_ORIGIN=http://localhost:5173
) > "%BACKEND%\.env"
:env_listo
echo [OK]  Backend\.env configurado

rem ---------- 4) Dependencias ----------
echo [..]  Instalando/verificando dependencias del backend...
pushd "%BACKEND%"
call npm install
popd
if not exist "%FRONTEND%\node_modules" (
    echo [..]  Instalando dependencias del frontend...
    pushd "%FRONTEND%"
    call npm install
    popd
)

rem ---------- 5) Seed (roles + super_admin, idempotente) ----------
echo [..]  Sembrando roles y super_admin
pushd "%BACKEND%"
call npm run seed
popd

rem ---------- 6) Backend ----------
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  Backend ya esta corriendo
) else (
    echo [..]  Levantando backend ^(puerto 3000^)
    start "" /min "%DIR_SCRIPT%run-backend.bat"
)

rem ---------- 7) Frontend ----------
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if %errorlevel%==0 (
    echo [OK]  Frontend ya esta corriendo
) else (
    echo [..]  Levantando frontend ^(puerto 5173^)
    start "" /min "%DIR_SCRIPT%run-frontend.bat"
)

echo.
echo ======================================
echo  DeskHub disponible en:
echo    Frontend : http://localhost:5173
echo    API      : http://localhost:3000/api
echo    Login    : superadmin@deskhub.com / SuperAdmin123
echo.
echo  Logs: .backend.log y .frontend.log
echo ======================================
endlocal