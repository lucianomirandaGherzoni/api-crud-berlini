# Berlini Pastas - API Backend

API RESTful para la gestión de productos, salsas e inventario. Desarrollada con Node.js, Express y Supabase.

## Tecnologías

- Node.js
- Express
- Supabase (PostgreSQL + Storage)
- Multer
- dotenv
- CORS

## Instalación

```bash
npm install
```

Configura el archivo `.env` con tus credenciales:

```env
PORT=3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_BUCKET_NAME=productos-imagenes
```

Inicia el servidor:

```bash
npm run dev
```

## Estructura del Proyecto

```
berlini-backend/
├── modulos/
│   ├── controlador.mjs
│   ├── modelo.mjs
│   ├── rutas.mjs
│   └── supabaseClient.mjs
├── index.mjs
└── package.json
```

## API Endpoints

### Productos

#### Obtener todos los productos
```http
GET /api/v1/productos
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Ravioles",
    "detalle": "Ravioles caseros de ricota y espinaca",
    "precio": 1500,
    "stock": 50,
    "imagen_url": "https://...",
    "categoria": "Pastas"
  }
]
```

#### Obtener un producto por ID
```http
GET /api/v1/productos/:id
```

**Parámetros:**
- `id` (number) - ID del producto

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Ravioles",
  "detalle": "Ravioles caseros de ricota y espinaca",
  "precio": 1500,
  "stock": 50,
  "imagen_url": "https://...",
  "categoria": "Pastas"
}
```

#### Crear un producto
```http
POST /api/v1/productos
```

**Body (JSON):**
```json
{
  "nombre": "Ñoquis",
  "detalle": "Ñoquis de papa",
  "precio": 1200,
  "stock": 30,
  "imagen_url": "https://...",
  "categoria": "Pastas"
}
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Producto agregado con éxito",
  "producto": { ... }
}
```

#### Modificar un producto
```http
PUT /api/v1/productos/:id
```

**Parámetros:**
- `id` (number) - ID del producto

**Body (JSON):**
```json
{
  "nombre": "Ñoquis",
  "detalle": "Ñoquis de papa caseros",
  "precio": 1300,
  "stock": 25,
  "imagen_url": "https://...",
  "categoria": "Pastas"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Producto con ID 1 modificado con éxito."
}
```

#### Eliminar un producto
```http
DELETE /api/v1/productos/:id
```

**Parámetros:**
- `id` (number) - ID del producto

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Producto con ID 1 eliminado con éxito."
}
```

### Salsas

#### Obtener todas las salsas
```http
GET /api/v1/salsas
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "salsa_nombre": "Bolognesa",
    "salsa_precio": 500,
    "salsa_stock": 100
  }
]
```

#### Obtener una salsa por ID
```http
GET /api/v1/salsas/:id
```

#### Crear una salsa
```http
POST /api/v1/salsas
```

**Body (JSON):**
```json
{
  "salsa_nombre": "Pesto",
  "salsa_precio": 600,
  "salsa_stock": 50
}
```

#### Modificar una salsa
```http
PUT /api/v1/salsas/:id
```

#### Eliminar una salsa
```http
DELETE /api/v1/salsas/:id
```

### Gestión de Imágenes

#### Subir una imagen
```http
POST /api/v1/productos/upload-image
```

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (file) - Archivo de imagen

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Imagen subida con éxito",
  "imageUrl": "https://...supabase.co/storage/v1/object/public/..."
}
```

#### Eliminar una imagen
```http
DELETE /api/v1/productos/delete-image
```

**Body (JSON):**
```json
{
  "imageUrl": "https://...supabase.co/storage/v1/object/public/..."
}
```

---

#### Descontar stock de múltiples ítems
```http
POST /api/v1/descontar-stock
```

**Body (JSON):**
```json
[
  {
    "id": 1,
    "type": "producto",
    "quantity": 2
  },
  {
    "id": 3,
    "type": "salsa",
    "quantity": 1
  }
]
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Stock descontado con éxito."
}
```

**Respuesta de error (500):**
```json
{
  "mensaje": "Error al procesar el pedido. Stock insuficiente para producto con ID 1. Stock actual: 1, Cantidad solicitada: 2"
}
```

## 🔐 Seguridad

- LBase de Datos

**Tabla productos:**
- id, nombre, detalle, precio, stock, imagen_url, categoria

**Tabla salsas:**
- id, salsa_nombre, salsa_precio, salsa_stock

## Despliegue

Configurado para Vercel. Asegúrate de configurar las variables de entorno en el panel de Vercel.

## Códigos de Estado

- 200 - OK
- 201 - Created
- 400 - Bad Request
- 404 - Not Found
- 500 - Internal Server Error