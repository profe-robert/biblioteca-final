# Biblioteca API (Backend)

API RESTful para la gestión de una biblioteca, catálogo bibliográfico, inventario de ejemplares físicos y flujo de préstamos y devoluciones. Desarrollada bajo el patrón arquitectónico **CSR (Controller → Service → Repository)** con **Spring Boot 4.2.0**, **Java 17**, **SQLite** y seguridad basada en **JWT** con **Refresh Tokens** persistentes.

---

## Características Principales

* **Arquitectura CSR:** Separación estricta entre controladores REST (`controller`), reglas de negocio transaccionales (`service`) y acceso a datos (`repository`).
* **Modelo de Dominio Desacoplado:** Diferenciación entre obra intelectual (`Libro`) y copias físicas individuales (`Ejemplar`) con trazabilidad de estado (`DISPONIBLE`, `PRESTADO`, `EN_REPARACION`, `PERDIDO`).
* **Seguridad Stateless con JWT y Refresh Tokens:**
  * Filtro personalizado (`OncePerRequestFilter`) para validación de Access Tokens (15 minutos de duración).
  * Refresh Tokens persistidos en SQLite (7 días de duración), reutilizables hasta su expiración o revocación explícita (`/logout`).
* **Control de Acceso Basado en Roles (RBAC):**
  * `ROLE_BIBLIOTECARIO`: Administración total de libros, ejemplares, préstamos y devoluciones.
  * `ROLE_SOCIO`: Consulta de catálogo y visualización exclusiva de sus propios préstamos.
* **Persistencia SQLite + Carga Inicial:** Base de datos embebida (`biblioteca.db`) con inicialización idempotente de usuarios y libros de prueba al arrancar.

---

## Stack Tecnológico

* **Java:** 17 LTS
* **Framework:** Spring Boot 4.2.0 (Spring Web, Spring Security 7, Spring Data JPA, Jakarta Validation)
* **Base de Datos:** SQLite (`org.xerial:sqlite-jdbc` + Hibernate 7 Community Dialects)
* **Autenticación:** JJWT `0.12.6` (HMAC-SHA256)
* **Utilidades:** Lombok, Maven

---

## Requisitos Previos

* **JDK 17** o superior instalado y configurado en `JAVA_HOME`.
* **Maven 3.9+** (o usar el wrapper incluido `./mvnw` / `mvnw.cmd`).

---

## Instalación y Ejecución

1. Ubícate en la carpeta raíz del proyecto:

```bash
cd biblioteca-api
```

2. Verifica que el puerto en `src/main/resources/application.yml` esté configurado en `8085`:

```yaml
server:
  port: 8085
```

3. Compila y ejecuta la aplicación:

```bash
# En Linux / macOS
./mvnw spring-boot:run

# En Windows (PowerShell / CMD)
.\mvnw.cmd spring-boot:run
```

4. Al iniciar por primera vez, se creará automáticamente el archivo `biblioteca.db` en la raíz del proyecto con datos de prueba precargados.

---

## Credenciales de Prueba

| Rol | Nombre | Email | Contraseña |
| :--- | :--- | :--- | :--- |
| **`ROLE_BIBLIOTECARIO`** | Ana Bibliotecaria | `bibliotecario@biblioteca.cl` | `Admin123!` |
| **`ROLE_SOCIO`** | Carlos Lector (ID: 2) | `socio@biblioteca.cl` | `Socio123!` |
| **`ROLE_SOCIO`** | Elena Morales (ID: 3) | `elena@biblioteca.cl` | `Socio123!` |

---

## Endpoints Principales

### Autenticación (`/api/auth`) — Públicos

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Autentica credenciales y retorna `accessToken` y `refreshToken`. |
| `POST` | `/api/auth/refresh` | Emite un nuevo `accessToken` usando un `refreshToken` vigente. |
| `POST` | `/api/auth/logout` | Revoca el `refreshToken` en la base de datos. |

### Catálogo (`/api/libros` y `/api/ejemplares`) — Requiere Bearer Token

| Método | Ruta | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/libros` | `BIBLIOTECARIO`, `SOCIO` | Lista todos los libros y sus ejemplares. |
| `GET` | `/api/libros/{id}` | `BIBLIOTECARIO`, `SOCIO` | Obtiene el detalle de un libro por ID. |
| `POST` | `/api/libros` | `BIBLIOTECARIO` | Registra un nuevo libro en el catálogo. |
| `GET` | `/api/libros/{id}/ejemplares` | `BIBLIOTECARIO`, `SOCIO` | Lista las copias físicas de un libro. |
| `POST` | `/api/ejemplares` | `BIBLIOTECARIO` | Agrega un ejemplar físico con código de barras. |

### Préstamos (`/api/prestamos`) — Requiere Bearer Token

| Método | Ruta | Roles Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/prestamos` | `BIBLIOTECARIO` | Lista el historial completo de préstamos. |
| `GET` | `/api/prestamos/mis-prestamos` | `BIBLIOTECARIO`, `SOCIO` | Lista los préstamos del usuario autenticado. |
| `POST` | `/api/prestamos` | `BIBLIOTECARIO` | Registra un préstamo asociando `usuarioId` y `codigoBarras`. |
| `POST` | `/api/prestamos/devolucion` | `BIBLIOTECARIO` | Registra la devolución por `codigoBarras` y libera el ejemplar. |

---

## Reglas de Negocio Implementadas

1. Un socio no puede pedir libros si su cuenta está `SUSPENDIDA` o si alcanzó su límite simultáneo (3 préstamos por defecto).
2. Solo pueden prestarse ejemplares en estado `DISPONIBLE`.
3. Si un ejemplar se devuelve después de su `fechaVencimiento`, el préstamo registra los días de mora y la cuenta del socio pasa automáticamente a estado `SUSPENDIDO`.