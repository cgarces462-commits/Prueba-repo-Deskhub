# GUIA DEL PROYECTO — Sistema de Facturación EPM

## Estructura del proyecto

```
Entrega-final-FE/
├── GUIA-PROYECTO.md              ← Este archivo
├── facturacion-dump.sql          ← Copia de seguridad de la BD (ej: mariadb < facturacion-dump.sql)
├── Imagenes-Prueba/              ← Capturas/imágenes de prueba del sistema
├── Facturacion-Proyect/           ← Raíz del monorepo
│   ├── start.sh                   ← Lanzador Linux (un clic)
│   ├── Backend/                   ← API REST (Express + Sequelize + MariaDB)
│   │   ├── .env / .env.example
│   │   ├── index.js               ← Punto de entrada del servidor
│   │   ├── package.json
│   │   └── src/
│   │       ├── config/            database.js, roles.js
│   │       ├── models/            role, user, cliente, servicio, tarifa, factura, pago
│   │       ├── repositories/      Capa de acceso a datos (uno por modelo)
│   │       ├── services/          Lógica de negocio (uno por entidad)
│   │       ├── controllers/       Handlers HTTP (uno por servicio)
│   │       ├── routes/            Definición de endpoints REST
│   │       ├── middlewares/       autenticar, autorizar, manejadorErrores
│   │       ├── seeders/           Datos iniciales (roles, usuarios, servicios, clientes)
│   │       └── utils/             jwt.util.js, password.util.js, moneda.js
│   └── frontend/                  ← SPA (React 19 + Vite)
│       ├── index.html
│       ├── vite.config.js
│       ├── package.json
│       └── src/
│           ├── main.jsx / App.jsx / index.css
│           ├── context/           TemaContext (claro/oscuro)
│           ├── services/          api.js (cliente HTTP con JWT)
│           ├── utils/             roles, validacion, catalogos
│           └── components/        Auth, Navbar, Dashboard, CRUDs
```

## Inicio rápido (Linux)

```bash
cd Facturacion-Proyect
chmod +x start.sh
./start.sh
```

## Inicio manual

```bash
# Terminal 1 — Backend
cd Backend
npm install
npm run seed    # Solo la primera vez
npm start       # Puerto 3000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev     # Puerto 5173
```

## Cuentas de prueba

| Rol             | Email                                  | Password       |
|-----------------|----------------------------------------|----------------|
| super_admin     | superadmin@facturacionmedellin.com     | SuperAdmin123  |
| administrador   | admin@facturacionmedellin.com          | Admin123       |
| facturador      | facturador@facturacionmedellin.com     | Facturador123  |
| cliente         | cliente@facturacionmedellin.com        | Cliente123     |
| auditor         | auditor@facturacionmedellin.com        | Auditor123     |

## Base de datos

Nombre: `facturacion_medellin` (MariaDB/MySQL en puerto 3307)

### Tablas

| Tabla      | Descripción |
|-----------|-------------|
| roles      | 5 roles del sistema |
| users      | Usuarios del sistema con su rol |
| clientes   | Clientes con NIT, cuenta, estrato, medidor |
| servicios  | Acueducto, Alcantarillado, Energía, Gas, Aseo |
| tarifas    | Tarifas por servicio con vigencia |
| facturas   | Facturas de consumo con estado |
| pagos      | Registro de pagos contra facturas |

### Restaurar la base de datos (desde el dump)

```bash
mariadb -h 127.0.0.1 -P 3307 -u root -e "CREATE DATABASE IF NOT EXISTS facturacion_medellin"
mariadb -h 127.0.0.1 -P 3307 -u root facturacion_medellin < facturacion-dump.sql
```

> Nota sobre puertos: el backend usa el puerto 3000 y el frontend el 5173. Si tienes el proyecto
> de Deskhub encendido, sus procesos ocuparán esos puertos; detenlos antes de arrancar este proyecto.

## Roles y permisos

| Rol             | Puede ver | Puede crear/editar | Puede eliminar |
|-----------------|-----------|---------------------|----------------|
| super_admin     | Todo      | Todo                | Todo           |
| administrador   | Todo      | Clientes, Servicios, Tarifas, Facturas | Servicios, Tarifas |
| facturador      | Todo      | Facturas, Pagos     | No             |
| cliente         | Sus facturas | Pagos           | No             |
| auditor         | Todo (solo lectura) | No         | No             |

## API REST

- `POST /api/auth/login` — Iniciar sesión
- `POST /api/auth/register` — Registrar usuario
- `GET /api/auth/profile` — Ver perfil autenticado
- `GET/POST/PUT/DELETE /api/clientes` — CRUD de clientes
- `GET/POST/PUT/DELETE /api/servicios` — CRUD de servicios
- `GET/POST/PUT/DELETE /api/tarifas` — CRUD de tarifas
- `GET/POST /api/facturas` — CRUD de facturas
- `PATCH /api/facturas/:id/status` — Cambiar estado
- `PATCH /api/facturas/:id/anular` — Anular factura
- `GET/POST /api/pagos` — Listar y registrar pagos
- `GET/PATCH/DELETE /api/users` — Gestión de usuarios

## Tecnologías

**Backend:** Node.js, Express 5, Sequelize 6, MariaDB/MySQL, JWT, bcryptjs
**Frontend:** React 19, Vite 8, CSS puro (temas claro/oscuro)
