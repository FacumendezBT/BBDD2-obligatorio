# BBDD2-obligatorio: Guía de Configuración y Uso

Este documento detalla la configuración y ejecución del proyecto BBDD2-obligatorio, un monorepo que contiene componentes tanto de frontend como de backend.

## Resumen del Proyecto

Este proyecto es un monorepo para BBDD2. Aunque inicialmente se consideró el uso de Docker y Docker Compose, se optó por la configuración manual de los servicios.

## Instrucciones de Configuración

### Configuración del Frontend

Para poner en marcha el frontend:
1. Navega hasta la carpeta `frontend`.
2. Instala las dependencias necesarias ejecutando `npm install`.
3. Inicia el servidor de desarrollo con `npm run dev`.

**Configuración del Entorno del Frontend (.env):**
Dentro de la carpeta `frontend`, crea un archivo `.env` y configura el `VITE_API_URL`. **Debes** reemplazar la URL de ejemplo con la URL real donde se está ejecutando tu backend.

Ejemplo de `.env` para el frontend:

VITE_API_URL=http://192.168.1.24:3000/api


### Configuración del Backend

Para poner en marcha el backend:
1. Entra en la carpeta `backend`.
2. Instala las dependencias necesarias ejecutando `npm install`.
3. Inicia el servidor de desarrollo con `npm run dev`.

**Configuración del Entorno del Backend (.env):**
Dentro de la carpeta `backend`, crea un archivo `.env` y configura los siguientes parámetros. Los parámetros `DB_HOST`, `DB_PORT` y `DB_NAME` deben apuntar a tu instancia de base de datos o, en su defecto, al centro de datos de la UCU.

Ejemplo de `.env` para el backend:
Para proporcionarte esto como un archivo .md, necesitas copiar el texto que generé anteriormente y pegarlo en un editor de texto. Luego, guarda ese archivo con la extensión .md (por ejemplo, README.md).

Aquí está el contenido que debes copiar:

Markdown

# BBDD2-obligatorio: Guía de Configuración y Uso

Este documento detalla la configuración y ejecución del proyecto BBDD2-obligatorio, un monorepo que contiene componentes tanto de frontend como de backend.

## Resumen del Proyecto

Este proyecto es un monorepo para BBDD2. Aunque inicialmente se consideró el uso de Docker y Docker Compose, se optó por la configuración manual de los servicios.

## Instrucciones de Configuración

### Configuración del Frontend

Para poner en marcha el frontend:
1. Navega hasta la carpeta `frontend`.
2. Instala las dependencias necesarias ejecutando `npm install`.
3. Inicia el servidor de desarrollo con `npm run dev`.

**Configuración del Entorno del Frontend (.env):**
Dentro de la carpeta `frontend`, crea un archivo `.env` y configura el `VITE_API_URL`. **Debes** reemplazar la URL de ejemplo con la URL real donde se está ejecutando tu backend.

Ejemplo de `.env` para el frontend:
VITE_API_URL=http://192.168.1.24:3000/api


### Configuración del Backend

Para poner en marcha el backend:
1. Entra en la carpeta `backend`.
2. Instala las dependencias necesarias ejecutando `npm install`.
3. Inicia el servidor de desarrollo con `npm run dev`.

**Configuración del Entorno del Backend (.env):**
Dentro de la carpeta `backend`, crea un archivo `.env` y configura los siguientes parámetros. Los parámetros `DB_HOST`, `DB_PORT` y `DB_NAME` deben apuntar a tu instancia de base de datos o, en su defecto, al centro de datos de la UCU.

Ejemplo de `.env` para el backend:

NODE_ENV=development
PORT=3000
DB_HOST=147.182.166.6
DB_PORT=3306
DB_NAME=ObligatorioBD2
DB_USER=root_remoto
DB_PASSWORD=MiPasswordSeguro2025
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
COOKIE_NAME=obligatorio_tokenito
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=
## Prueba de la Aplicación

**IMPORTANTE: La app solo va a funcionar si se ingresa la ip desde la que se quiere conectar (la IP de la compu desde la que se prueba) en el campo ip_totem de la tabla Circuio en formato: ::ffff:192.168.1.35**

Una vez que la aplicación esté levantada y conectada a la base de datos, puedes usar las siguientes credenciales para realizar pruebas:

* **Votante:**
    * Usuario: `ava33108`
* **Miembro de Mesa:**
    * Usuario: `CJB67890`
    * Contraseña: `Password123`
