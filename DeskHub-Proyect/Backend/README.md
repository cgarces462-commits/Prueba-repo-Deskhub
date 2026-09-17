# DeskHub Backend — API de reservas de espacios de coworking

Stack: Node.js + Express 5 + Sequelize 6 + MySQL, autenticación con JWT, validación de esquemas con Joi.

## Arquitectura (Modelo N-Capas)

La API sigue el modelo de **6 capas** exigido; una petición fluye siempre en este orden:

```
Rutas (Routes) → Middlewares → Controladores (Controllers) → Servicios (Services) → Repositorios (Repositories) → Modelos (Models)
```

- **Routes**: punto de entrada HTTP, sin lógica.
- **Middlewares**: autenticación (JWT), autorización por rol y validación de esquemas (Joi).
- **Controllers**: orquestan la petición y formatean la respuesta HTTP.
- **Services**: lógica de negocio (reglas de permisos, validaciones de dominio, traslape de reservas).
- **Repositories**: único acceso a la base de datos.
- **Models**: estructura de datos y relaciones (1:N) de la base de datos.

```
Backend/
  index.js                     Bootstrap del servidor
  src/
    config/
      database.js               Conexión Sequelize a MySQL
      roles.js                  Constantes de los 5 roles del sistema
    models/
      RolModel.js, UsuarioModel.js, EspacioModel.js, ReservaModel.js,
      ImagenEspacioModel.js     (+ asociaciones en ModelosIndex.js)
    repositories/
      RolRepository.js, UsuarioRepository.js, EspacioRepository.js,
      ReservaRepository.js, ImagenEspacioRepository.js
    services/
      AuthService.js, UsuarioService.js, EspacioService.js, ReservaService.js
    controllers/
      AuthController.js, UsuarioController.js, EspacioController.js, ReservaController.js
    routes/
      RutasIndex.js, AuthRoutes.js, UsuarioRoutes.js, EspacioRoutes.js, ReservaRoutes.js
    middlewares/
      AuthMiddleware.js         autenticar (JWT) y autorizar (roles)
      ValidationMiddleware.js   validación de esquemas con Joi
      UploadMiddleware.js       subida de imágenes (multer)
      ErrorMiddleware.js        manejo centralizado de errores y 404
    seeders/
      roles.seeder.js           crea los 5 roles + usuario super_admin inicial
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

> Alternativa: desde la raíz del proyecto usa `scripts/linux/start.sh` (Linux, MySQL embebido),
> `scripts/windows/start-wamp.bat` (WAMP) o `scripts/windows/start-xampp.bat` (XAMPP) y todo se configura solo.

Credenciales creadas por el seed:
- **email:** `superadmin@deskhub.com`
- **password:** `SuperAdmin123`

> Cámbiala apenas puedas iniciar sesión, es solo para arrancar el sistema.

## Documentación de la API

Base URL: `http://localhost:3000/api` · Las rutas protegidas usan el header:

```
Authorization: Bearer <token>
```

### Respuestas de error (formato común)

Todas las capas de error responden con el mismo formato:

```json
{ "mensaje": "Credenciales inválidas" }
```

Cuando la validación de esquemas (Joi) falla, se devuelve `400` con el detalle:

```json
{
  "mensaje": "Datos de entrada inválidos",
  "errores": ["'email' must be a valid email", "'password' length must be at least 6 characters long"]
}
```

### Auth

#### `POST /api/auth/register` — Registro público (queda como `cliente`)
No requiere token.

**Cuerpo de petición:**
```json
{
  "nombre": "María",
  "apellido": "López",
  "email": "maria@correo.com",
  "password": "secreta123",
  "telefono": "3001234567"
}
```
**Respuesta `201`:**
```json
{
  "mensaje": "Usuario registrado con éxito",
  "usuario": {
    "id": 6,
    "nombre": "María",
    "apellido": "López",
    "email": "maria@correo.com",
    "telefono": "3001234567",
    "activo": true,
    "roleId": 4,
    "role": { "id": 4, "nombre": "cliente" },
    "createdAt": "2026-09-16T10:00:00.000Z",
    "updatedAt": "2026-09-16T10:00:00.000Z"
  }
}
```
**Errores:** `400` datos inválidos · `409` email ya registrado.

#### `POST /api/auth/login` — Iniciar sesión
No requiere token.

**Cuerpo:**
```json
{ "email": "superadmin@deskhub.com", "password": "SuperAdmin123" }
```
**Respuesta `200`:**
```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "nombre": "Super",
    "apellido": "Admin",
    "email": "superadmin@deskhub.com",
    "role": { "id": 1, "nombre": "super_admin" }
  }
}
```
**Errores:** `400` campos vacíos · `401` credenciales inválidas · `403` usuario inactivo.

#### `GET /api/auth/profile` — Perfil del usuario autenticado
Requiere token. Respuesta `200` con el objeto `usuario`.

### Usuarios (gestión) — requiere token

| Método | Endpoint             | Roles permitidos        | Descripción                    |
|--------|----------------------|-------------------------|--------------------------------|
| GET    | `/api/users`         | `super_admin`, `admin`  | Lista todos los usuarios       |
| GET    | `/api/users/:id`     | `super_admin`, `admin`  | Detalle de un usuario          |
| PATCH  | `/api/users/:id/role`| `super_admin`           | Cambia el rol                  |
| PATCH  | `/api/users/:id/status` | `super_admin`, `admin`| Activa/desactiva un usuario    |
| DELETE | `/api/users/:id`     | `super_admin`           | Elimina un usuario             |

**`PATCH /api/users/:id/role`**
```json
{ "rol": "recepcionista" }
```
**`PATCH /api/users/:id/status`**
```json
{ "activo": false }
```

### Espacios — requiere token

| Método | Endpoint                     | Roles permitidos           | Descripción                          |
|--------|------------------------------|----------------------------|--------------------------------------|
| GET    | `/api/spaces`                | cualquier autenticado      | Lista (filtros `?tipo=` `&disponible=`) |
| GET    | `/api/spaces/:id`            | cualquier autenticado      | Detalle de un espacio                |
| POST   | `/api/spaces`                | `super_admin`, `admin`     | Crea un espacio                      |
| PUT    | `/api/spaces/:id`            | `super_admin`, `admin`     | Actualiza un espacio                 |
| DELETE | `/api/spaces/:id`            | `super_admin`              | Elimina un espacio                   |
| POST   | `/api/spaces/:id/images`     | `super_admin`, `admin`     | Sube imagen (multipart, campo `imagen`) |
| DELETE | `/api/spaces/:id/images/:imagenId` | `super_admin`, `admin` | Elimina una imagen                   |

**`POST /api/spaces`**
```json
{
  "nombre": "Sala Neptuno",
  "tipo": "sala_reunion",
  "ubicacion": "Piso 3 - Zona Norte",
  "capacidad": 8,
  "precioPorHora": 25.50,
  "descripcion": "Sala con videoproyector y pizarra"
}
```
**Respuesta `201`:** objeto `espacio` con su arreglo `imagenes`.

**Tipos válidos:** `escritorio`, `oficina_privada`, `sala_reunion`, `sala_conferencia`.

### Reservas — requiere token

| Método | Endpoint                          | Roles permitidos           | Descripción                          |
|--------|-----------------------------------|----------------------------|--------------------------------------|
| GET    | `/api/reservations`               | todos autenticados         | `cliente`/`invitado` ven solo las suyas; el resto ve todas |
| GET    | `/api/reservations/:id`           | propietario o staff        | Detalle de una reserva               |
| POST   | `/api/reservations`               | cualquier autenticado      | Crea reserva para sí mismo           |
| PATCH  | `/api/reservations/:id/status`    | `super_admin`, `admin`, `recepcionista` | Cambia el estado          |
| PATCH  | `/api/reservations/:id/cancel`    | propietario o staff        | Cancela la reserva                   |

**`POST /api/reservations`**
```json
{
  "spaceId": 1,
  "fechaInicio": "2026-10-01T09:00:00.000Z",
  "fechaFin": "2026-10-01T11:00:00.000Z",
  "notas": "Reunión de equipo"
}
```
**Respuesta `201`:**
```json
{
  "mensaje": "Reserva creada",
  "reserva": {
    "id": 12,
    "userId": 6,
    "spaceId": 1,
    "fechaInicio": "2026-10-01T09:00:00.000Z",
    "fechaFin": "2026-10-01T11:00:00.000Z",
    "estado": "pendiente",
    "notas": "Reunión de equipo",
    "espacio": { "id": 1, "nombre": "Sala Neptuno" },
    "usuario": { "id": 6, "nombre": "María", "apellido": "López", "email": "maria@correo.com" }
  }
}
```
**Regla de negocio:** el servicio valida que no exista un **traslape de horario** en el mismo espacio; si lo hay responde `409` `"El espacio ya está reservado en ese horario"`.

**Estados válidos:** `pendiente`, `confirmada`, `cancelada`, `completada`.

**`PATCH /api/reservations/:id/status`**
```json
{ "estado": "confirmada" }
```

## Notas técnicas

- `sequelize.sync()` crea las tablas automáticamente al iniciar (no usa migraciones formales, ideal para esta prueba técnica).
- Las columnas de la base de datos usan `snake_case` (`role_id`, `fecha_inicio`, `precio_por_hora`, `created_at`, `updated_at`…).
- Las contraseñas se almacenan con `bcryptjs` (nunca en texto plano); el modelo `UsuarioModel` excluye `password` por defecto en las consultas.
- Las validaciones de negocio (traslape de reservas, roles válidos, email duplicado, etc.) viven en la capa `services/`, no en los controladores.
- La validación de esquemas de entrada se hace en la capa de `middlewares/` con Joi, antes de llegar al controlador.
- El backend fue verificado con un smoke test funcional (registro, login, cambio de rol, creación de espacio/reserva y bloqueo de traslapes) antes de la entrega.