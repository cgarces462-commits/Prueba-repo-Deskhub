# DeskHub — Guía de Inicio y Validaciones

## 1. Prerrequisitos

- Node.js ≥ 18
- MySQL/MariaDB corriendo en `localhost:3307` (o ajustar `Backend/.env`)
- npm (viene con Node)

---

## 2. Estructura del proyecto

```
Proyect-Deskhub/
├── Backend/              API REST (Express + Sequelize + MySQL)
├── frontend/             Interfaz web (React + Vite)
├── Imagenes-Prueba/      Logos de ejemplo
├── start.sh              Arranque del proyecto en un comando
└── GUIA-PROYECTO.md      Este archivo
```

---

## 3. Puesta en marcha

### 3.0 Forma rápida (recomendada)

El proyecto ya incluye un script que levanta todo automáticamente
(MySQL 🐬 + seed + backend + frontend):

```bash
cd DeskHub-Proyect
./start.sh
```

Luego abre **http://localhost:5173**.

> El script es idempotente: si MySQL, el backend o el frontend ya están
> corriendo, no los duplica. Los logs quedan en `.backend.log` y `.frontend.log`.

### 3.1 Base de datos

```sql
CREATE DATABASE IF NOT EXISTS deskhub;
```

> Las tablas se crean automáticamente al iniciar el backend (`sequelize.sync()`).

### 3.2 Backend

```bash
cd DeskHub-Proyect/Backend

# Instalar dependencias (solo la primera vez)
npm install

# Configurar variables de entorno (ya viene el .env por defecto)
# Puerto: 3000 | MySQL: localhost:3307 | DB: deskhub | JWT: 8h
cat .env

# Sembrar los 5 roles + usuario super_admin + usuarios de prueba
npm run seed

# Iniciar el servidor (producción)
npm start

# O en modo desarrollo (con nodemon, auto-reload)
npm run dev
```

**Usuarios sembrados (prueba):**

| Rol              | Email                         | Password            |
|------------------|-------------------------------|---------------------|
| `super_admin`    | superadmin@deskhub.com        | SuperAdmin123       |
| `admin`          | admin@deskhub.com             | Admin123            |
| `recepcionista`  | recepcionista@deskhub.com     | Recepcionista123    |
| `cliente`        | cliente@deskhub.com           | Cliente123          |
| `invitado`       | invitado@deskhub.com          | Invitado123         |

### 3.3 Frontend

```bash
cd DeskHub-Proyect/frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar el servidor de desarrollo (Vite)
npm run dev
```

### 3.4 Verificar

Abrir **http://localhost:5173** en el navegador.

- Login con `superadmin@deskhub.com` / `SuperAdmin123`
- Registrar un nuevo usuario (queda como `cliente`)
- Probar los diferentes roles (cada uno ve distintas opciones en el Navbar)

---

## 4. Mapa de validaciones (Checklist del Proyecto Final)

### 4.1 Inicio de Sesión

| # | Criterio | Archivo | Línea(s) |
|---|----------|---------|----------|
| 1 | Login con correo y contraseña (inputs controlados) | `frontend/src/components/LoginForm.jsx` | 8 (useState form), 49-68 (Campo value/onChange) |
| 2 | No permite campos vacíos | `frontend/src/utils/validacion.js` | 9-15 (`validarLogin`) |
| 3 | Valida formato de correo electrónico | `frontend/src/utils/validacion.js` | 1-7 (`RE_EMAIL`) |
| 4 | Error claro si correo o contraseña no coinciden | `Backend/src/services/auth.service.js` | 56, 66 ("Credenciales inválidas") |
|   | Se muestra en el formulario | `frontend/src/components/LoginForm.jsx` | 33, 45 |
| 5 | Botón deshabilitado + "Ingresando..." | `frontend/src/components/LoginForm.jsx` | 35, 71-72 |
| 6 | Redirige a pantalla principal tras login | `frontend/src/App.jsx` | 30-34 (`onLogin` → `setVista('inicio')`) |

---

### 4.2 Registro

| # | Criterio | Archivo | Línea(s) |
|---|----------|---------|----------|
| 7 | Nombre, correo, contraseña, confirmar | `frontend/src/components/RegistroForm.jsx` | 8-15, 60-115 |
| 8 | Correo ya registrado | `Backend/src/services/auth.service.js` | 24-27 (HTTP 409) |
|   | Se muestra en el formulario | `frontend/src/components/RegistroForm.jsx` | 45, 56 |
| 9 | Longitud mínima de contraseña (≥ 6) | `frontend/src/utils/validacion.js` | 24-26 |
| 10 | Contraseña y confirmación coinciden | `frontend/src/utils/validacion.js` | 27-29 |
| 11 | Mensaje de éxito al registrarse | `frontend/src/App.jsx` | 48-50, 54 |
|   | Se muestra como alerta verde | `frontend/src/components/LoginForm.jsx` | 44 |
| 12 | Enlace para volver al login | `frontend/src/components/RegistroForm.jsx` | 122-127 |

---

### 4.3 Separado por Componentes

| # | Criterio | Ubicación |
|---|----------|-----------|
| 13 | Un componente por responsabilidad | `frontend/src/components/`: LoginForm, RegistroForm, Navbar, Dashboard, EspaciosList, ReservasList, UsuariosList, Campo, SearchBar, AuthLayout, etc. |
| 14 | Sin lógica de negocio en App.jsx | `frontend/src/App.jsx` (solo sesión/vistas); datos en `services/api.js` y `utils/` |
| 15 | Presentacionales vs con estado | UI: Campo, SearchBar, AuthLayout, Navbar, SelectorTema · Datos: EspaciosList, ReservasList, UsuariosList, EspacioModal, ReservaModal, CarruselImagenes |
| 16 | Reutilización de componentes | `Campo` en 5+ formularios, `SearchBar` en 3 listas, `AuthLayout` en login/registro |
| 17 | Nombres en PascalCase | Coherente: LoginForm.jsx, RegistroForm.jsx, EspacioModal.jsx, etc. |

---

### 4.4 Validación

| # | Criterio | Archivo | Línea(s) |
|---|----------|---------|----------|
| 18 | Reglas por campo (obligatorio, formato, min/max) | `frontend/src/utils/validacion.js` | `validarLogin` (L9), `validarRegistro` (L17), `validarEspacio` (L40), `campoObligatorio` (L33) |
| 19 | Errores visibles bajo cada campo | `frontend/src/components/Campo.jsx` | 26 (clase `invalido`), 30 (`mensaje-error`) |
|   | Estilo visual del error | `frontend/src/index.css` | 957-965 (`input.invalido`, `.mensaje-error`) |
| 20 | Validación en todos los formularios | Login: `LoginForm.jsx:21` · Registro: `RegistroForm.jsx:29` · Espacio: `EspacioModal.jsx:44` · Reserva: `ReservasList.jsx:79` |
| 21 | Usa `.trim()` | `validacion.js:4,34` · `EspaciosList.jsx:64` · `ReservasList.jsx:55` · `UsuariosList.jsx:34` · `EspacioModal.jsx:51-56` · `ReservaModal.jsx:53` |
| 22 | Feedback visual (borde rojo) | `Campo.jsx:26` → `index.css:957` (`border-color: var(--error)`) |

---

### 4.5 Búsqueda

| # | Criterio | Archivo | Línea(s) |
|---|----------|---------|----------|
| 23 | Barra de búsqueda funcional | `SearchBar` → `EspaciosList.jsx:116`, `ReservasList.jsx:178`, `UsuariosList.jsx:88` |
| 24 | Busca en más de un campo | Espacios: nombre/ubicación/tipo/descripción (`EspaciosList.jsx:67-69`) · Reservas: espacio/usuario/email/estado/notas (`ReservasList.jsx:58-67`) · Usuarios: nombre/apellido/email/teléfono/rol (`UsuariosList.jsx:37-39`) |
| 25 | Mensaje claro sin resultados | `EspaciosList.jsx:128-130` · `ReservasList.jsx:190-192` · `UsuariosList.jsx:99-101` |
| 26 | No distingue mayúsculas/minúsculas | `.toLowerCase()` en los 3 filtros: `EspaciosList.jsx:64`, `ReservasList.jsx:55`, `UsuariosList.jsx:34` |
| 27 | Predecible al cambiar de sección | Estado de búsqueda local por componente (`useState`), se resetea al navegar |

---

### 4.6 Roles

| # | Criterio | Archivo | Línea(s) |
|---|----------|---------|----------|
| 28 | Roles definidos con claridad (5 roles) | `frontend/src/utils/roles.js:1-7` · `Backend/src/config/roles.js` (con descripción) |
| 29 | Rol guardado en la sesión al login | `frontend/src/services/api.js:21-24` (`guardarSesion`) · Sesión leída en `App.jsx:13` |
| 30 | UI muestra/oculta opciones según rol | `Navbar.jsx:19-21` (tab Usuarios) · `EspaciosList.jsx:107,197,207` (CRUD) · `ReservasList.jsx:251-273` (staff vs cliente) · `Dashboard.jsx:96-108` (tarjetas diferentes) |
| 31 | Acciones sensibles protegidas por rol | Backend: `auth.middleware.js:29-41` (`autorizar`) usado en `space.routes.js`, `user.routes.js`, `reservation.routes.js` |
| 32 | Mensaje claro si usuario intenta acción sin permisos | `auth.middleware.js:35-37` → 403 "No tienes permisos suficientes..." · Frontend lo muestra en `EspaciosList.jsx:87`, `ReservasList.jsx:105`, `UsuariosList.jsx:45-47` |

---

## 5. Puertos

| Servicio  | Puerto | Dónde se configura             |
|-----------|--------|--------------------------------|
| Frontend  | 5173   | `frontend/vite.config.js`      |
| Backend   | 3000   | `Backend/.env` → `PORT=3000`  |
| MySQL     | 3307   | `Backend/.env` → `DB_PORT=3307`|

> Vite proxea `/api` y `/uploads` hacia el backend automáticamente.

---

## 6. Scripts útiles

| Comando                          | Dónde    | Qué hace                              |
|----------------------------------|----------|---------------------------------------|
| `npm run dev`                    | Backend  | Inicia con nodemon (auto-reload)      |
| `npm start`                      | Backend  | Inicia en producción (node)           |
| `npm run seed`                   | Backend  | Semilla: roles + super_admin + prueba |
| `npm run dev`                    | Frontend | Inicia Vite con HMR                   |
| `npm run build`                  | Frontend | Compila producción                    |
| `npm run lint`                   | Frontend | Linting con oxlint                    |
