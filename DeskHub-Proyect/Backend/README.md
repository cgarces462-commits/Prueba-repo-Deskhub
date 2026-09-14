# DeskHub Backend — API de reservas de espacios de coworking

Stack: Node.js + Express 5 + Sequelize 6 + MySQL, autenticación con JWT.

## Estructura

```
Backend/
  index.js                     Bootstrap del servidor
  src/
    config/
      database.js               Conexión Sequelize a MySQL
      roles.js                  Constantes de los 5 roles del sistema
    models/                    Role, User, Space, Reservation (+ asociaciones en index.js)
    repositories/              Acceso a datos (una capa por modelo)
    services/                  Lógica de negocio y reglas de permisos
    controllers/                Manejo de request/response
    routes/                    Definición de endpoints por recurso
    middlewares/
      auth.middleware.js        autenticar (JWT) y autorizar (roles)
      error.middleware.js       Manejo centralizado de errores y 404
    seeders/
      roles.seeder.js           Crea los 5 roles + usuario super_admin inicial
```

## Los 5 roles

| Rol             | Descripción                                                         |
|-----------------|----------------------------------------------------------------------|
| `super_admin`   | Control total de la plataforma (usuarios, roles, todas las sedes)   |
| `admin`         | Administra los espacios de una sede de coworking                    |
| `recepcionista` | Gestiona el día a día: confirma/cancela reservas                    |
| `cliente`       | Reserva espacios (rol por defecto al registrarse)                   |
| `invitado`      | Acceso limitado, puede ver espacios y reservar como visitante        |

Por seguridad, el registro público (`POST /api/auth/register`) siempre asigna el rol `cliente`.
Los roles administrativos solo los asigna un `super_admin` desde `PATCH /api/users/:id/role`.

## Puesta en marcha

```bash
cd Backend
npm install
cp .env.example .env      # y ajusta las credenciales de tu MySQL local
npm run seed               # crea los 5 roles + usuario super_admin
npm run dev                 # levanta el servidor con nodemon (o "npm start")
```

Credenciales creadas por el seed:
- **email:** `superadmin@deskhub.com`
- **password:** `SuperAdmin123`

> Cámbiala apenas puedas iniciar sesión, es solo para arrancar el sistema.

## Endpoints principales

### Auth
- `POST /api/auth/register` — registro público (queda como `cliente`)
- `POST /api/auth/login` — devuelve `{ token, usuario }`
- `GET /api/auth/profile` — perfil del usuario autenticado (requiere token)

### Usuarios (gestión) — requiere token
- `GET /api/users` — `super_admin`, `admin`
- `GET /api/users/:id` — `super_admin`, `admin`
- `PATCH /api/users/:id/role` — solo `super_admin` (`{ "rol": "recepcionista" }`)
- `PATCH /api/users/:id/status` — `super_admin`, `admin` (`{ "activo": false }`)
- `DELETE /api/users/:id` — solo `super_admin`

### Espacios — requiere token
- `GET /api/spaces` — cualquier usuario autenticado (filtros opcionales `?tipo=` `&disponible=`)
- `GET /api/spaces/:id` — cualquier usuario autenticado
- `POST /api/spaces` — `super_admin`, `admin`
- `PUT /api/spaces/:id` — `super_admin`, `admin`
- `DELETE /api/spaces/:id` — solo `super_admin`

### Reservas — requiere token
- `GET /api/reservations` — `cliente`/`invitado` ven solo las suyas; el resto ve todas
- `GET /api/reservations/:id`
- `POST /api/reservations` — cualquier usuario autenticado reserva para sí mismo
  (valida traslape de horario contra el mismo espacio)
- `PATCH /api/reservations/:id/status` — `super_admin`, `admin`, `recepcionista`
- `PATCH /api/reservations/:id/cancel` — el dueño de la reserva o el staff

Todas las rutas protegidas usan el header:
```
Authorization: Bearer <token>
```

## Notas técnicas

- `sequelize.sync()` crea las tablas automáticamente al iniciar (no usa migraciones formales, ideal para esta prueba técnica).
- Las contraseñas se almacenan con `bcryptjs` (nunca en texto plano); el modelo `User` excluye `password` por defecto en las consultas.
- Las validaciones de negocio (traslape de reservas, roles válidos, email duplicado, etc.) viven en la capa `services/`, no en los controladores.
- El backend fue verificado con un smoke test funcional (registro, login, cambio de rol, creación de espacio/reserva y bloqueo de traslapes) antes de la entrega.
