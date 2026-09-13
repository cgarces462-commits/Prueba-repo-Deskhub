#!/usr/bin/env bash
set -euo pipefail

# Directorio raíz del proyecto (DeskHub-Proyect)
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$RAIZ/Backend"
FRONTEND="$RAIZ/frontend"

DATADIR="$BACKEND/.mysql/data"
SOCKET="$BACKEND/.mysql/mysql.sock"
PIDFILE="$BACKEND/.mysql/mysql.pid"
ERRLOG="$BACKEND/.mysql/mysql.err"
PUERTO_DB=3307

echo "======================================"
echo " DeskHub - arranque del proyecto"
echo "======================================"

# 1) MySQL local en el puerto 3307
if mysqladmin -h 127.0.0.1 -P "$PUERTO_DB" -u root ping >/dev/null 2>&1; then
  echo "OK  MySQL ya está corriendo (puerto $PUERTO_DB)"
else
  if [ ! -d "$DATADIR" ]; then
    echo "... Inicializando la base de datos local (primera vez)"
    mkdir -p "$BACKEND/.mysql"
    mariadb-install-db \
      --datadir="$DATADIR" \
      --auth-root-authentication-method=normal \
      --user="$(id -un)" >/dev/null
  fi
  echo "... Levantando MySQL (puerto $PUERTO_DB)"
  setsid mysqld \
    --datadir="$DATADIR" \
    --socket="$SOCKET" \
    --pid-file="$PIDFILE" \
    --port="$PUERTO_DB" \
    --bind-address=127.0.0.1 \
    --user="$(id -un)" \
    --log-error="$ERRLOG" </dev/null >/dev/null 2>&1 &
  for _ in $(seq 1 30); do
    mysqladmin -h 127.0.0.1 -P "$PUERTO_DB" -u root ping >/dev/null 2>&1 && break
    sleep 1
  done
  if mysqladmin -h 127.0.0.1 -P "$PUERTO_DB" -u root ping >/dev/null 2>&1; then
    mysql -h 127.0.0.1 -P "$PUERTO_DB" -u root \
      -e "CREATE DATABASE IF NOT EXISTS deskhub" >/dev/null 2>&1 || true
    echo "OK  MySQL listo"
  else
    echo "ERROR No se pudo iniciar MySQL. Revisa: $ERRLOG"
    exit 1
  fi
fi

# 2) Archivo .env del backend
if [ ! -f "$BACKEND/.env" ]; then
  echo "... Creando Backend/.env"
  sed -e 's/^DB_HOST=.*/DB_HOST=127.0.0.1/' \
      -e 's/^DB_PORT=.*/DB_PORT=3307/' \
      "$BACKEND/.env.example" > "$BACKEND/.env"
fi

# 3) Dependencias
if [ ! -d "$BACKEND/node_modules" ]; then
  echo "... Instalando dependencias del backend"
  (cd "$BACKEND" && npm install)
fi
if [ ! -d "$FRONTEND/node_modules" ]; then
  echo "... Instalando dependencias del frontend"
  (cd "$FRONTEND" && npm install)
fi

# 4) Seed (roles + super_admin). Es idempotente.
echo "... Sembrando roles y usuario super_admin"
(cd "$BACKEND" && npm run seed) || true

# 5) Backend (puerto 3000)
if pkill -0 -f "node index.js" >/dev/null 2>&1; then
  echo "OK  Backend ya está corriendo"
else
  echo "... Levantando backend (puerto 3000)"
  (cd "$BACKEND" && setsid npm start </dev/null >"$RAIZ/.backend.log" 2>&1 &)
fi

# 6) Frontend (puerto 5173)
if pkill -0 -f "node_modules/.bin/vite" >/dev/null 2>&1; then
  echo "OK  Frontend ya está corriendo"
else
  echo "... Levantando frontend (puerto 5173)"
  (cd "$FRONTEND" && setsid npm run dev </dev/null >"$RAIZ/.frontend.log" 2>&1 &)
fi

sleep 3
echo
echo "======================================"
echo " DeskHub disponible en:"
echo "   Frontend : http://localhost:5173"
echo "   API      : http://localhost:3000/api"
echo "   Login    : superadmin@deskhub.com / SuperAdmin123"
echo
echo " Logs: .backend.log  y  .frontend.log"
echo "======================================"
