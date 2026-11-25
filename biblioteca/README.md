# Biblioteca Web (Frontend)

Interfaz web desarrollada en **React** y **Vite** para interactuar con la API de gestión bibliotecaria. Construida íntegramente con componentes de **React-Bootstrap**, soporte nativo para cambio dinámico entre **tema claro y oscuro**, manejo de estado global mediante **Context + Hooks (`useReducer`)**, y cliente **Axios** con interceptor automático para renovación transparente de tokens JWT.

---

## Características Principales

* **UI 100% React-Bootstrap:** Modales, tarjetas, acordeones, tablas responsivas, notificaciones (`Toast`) y barra de navegación construidos exclusivamente con componentes de `react-bootstrap`.
* **Tema Claro / Oscuro Persistente:** Alternancia instantánea desde la barra superior utilizando el atributo nativo `data-bs-theme` de Bootstrap 5.3+ y almacenamiento en `localStorage`.
* **Store Global con Hooks:** Gestión centralizada de autenticación, sesión, catálogo, préstamos y alertas a través de `StoreContext` y hooks personalizados (`useAuth`, `useTheme`, `useStore`).
* **Interceptor Axios con Cola de Peticiones:**
  * Inyecta automáticamente la cabecera `Authorization: Bearer <accessToken>` en cada solicitud protegida.
  * Intercepta respuestas `401 Unauthorized`, solicita un nuevo `accessToken` a `/api/auth/refresh` usando el `refreshToken` almacenado y reintenta las peticiones fallidas sin interrumpir la experiencia del usuario.
* **Vistas Adaptadas por Rol:**
  * **Bibliotecario:** Acceso a creación de libros, alta de ejemplares físicos, registro de préstamos rápidos y gestión global de devoluciones.
  * **Socio:** Búsqueda y consulta de disponibilidad en el catálogo y visualización de su historial personal de préstamos.

---

## Stack Tecnológico

* **Librería UI:** React + Vite
* **Estilos y Componentes:** Bootstrap 5, React-Bootstrap, Bootstrap Icons
* **Enrutamiento:** React Router DOM
* **Cliente HTTP:** Axios

---

## Requisitos Previos

* **Node.js 18+** y **npm**.
* El backend **`biblioteca-api`** ejecutándose en `http://localhost:8085` con CORS habilitado para `http://localhost:5173`.

---

## Instalación y Ejecución

1. Ubícate en la carpeta raíz del proyecto frontend:

```bash
cd biblioteca
```

2. Instala las dependencias:

```bash
npm install
```

3. Verifica la URL base del backend en `src/api/axiosClient.js` (configurada por defecto para el puerto `8085`):

```javascript
const BASE_URL = 'http://localhost:8085/api';
```

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

5. Abre el navegador en `http://localhost:5173`.

---

## Estructura del Proyecto

```text
src/
├── api/
│   ├── axiosClient.js             # Instancia Axios e interceptor de refresco de JWT
│   ├── authApi.js                 # Llamadas a /auth/login, /refresh y /logout
│   ├── librosApi.js               # Llamadas a /libros y /ejemplares
│   └── prestamosApi.js            # Llamadas a /prestamos y /devolucion
├── components/
│   ├── layout/
│   │   ├── AppNavbar.jsx          # Barra superior, selector de tema e info de usuario
│   │   └── ProtectedRoute.jsx     # Protección de rutas privadas
│   ├── libros/
│   │   ├── LibroModal.jsx         # Formulario modal para registrar libros
│   │   └── EjemplarModal.jsx      # Formulario modal para agregar copias físicas
│   └── prestamos/
│       ├── NuevoPrestamoModal.jsx # Modal para asignar préstamos a socios
│       └── DevolucionModal.jsx    # Modal para procesar devoluciones
├── pages/
│   ├── LoginPage.jsx              # Pantalla de inicio de sesión con accesos rápidos
│   ├── CatalogoPage.jsx           # Listado, buscador y detalle de ejemplares
│   └── PrestamosPage.jsx          # Tabla de préstamos globales o personales
├── store/
│   ├── StoreContext.jsx           # Proveedor global y hooks (useAuth, useTheme, useStore)
│   └── storeReducer.js            # Reducer y estado inicial persistido en localStorage
├── App.jsx                        # Definición de rutas y contenedor de notificaciones Toast
└── main.jsx                       # Carga global de CSS de Bootstrap y montaje de la app
```

---

## Guía Rápida de Uso

1. **Inicio de Sesión:** En la pantalla `/login`, puedes usar los botones de **Cuentas rápidas de prueba** para autocompletar las credenciales de **Bibliotecario** (`bibliotecario@biblioteca.cl` / `Admin123!`) o **Socio** (`socio@biblioteca.cl` / `Socio123!`).
2. **Explorar Catálogo:** Usa el buscador superior para filtrar por título, autor o ISBN. Despliega el acordeón *"Ver Ejemplares Físicos"* en cada tarjeta para ver códigos de barras, ubicación y disponibilidad.
3. **Prestar y Devolver (Rol Bibliotecario):**
   * Haz clic en **Prestar** junto a cualquier ejemplar disponible en el catálogo, ingresa el ID del socio (ej. `2` o `3`) y confirma.
   * Ve a la pestaña **Gestión de Préstamos** para visualizar préstamos activos, detectar retrasos y registrar devoluciones con un clic.