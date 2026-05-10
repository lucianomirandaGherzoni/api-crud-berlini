# berlini-backend — API REST

API RESTful para gestión de productos, extras, órdenes e inventario. Construida con Node.js + Express 5 y desplegada en Vercel como serverless. Toda persistencia y autenticación delegada a Supabase.

---

## Stack

| | |
|---|---|
| Runtime | Node.js (ES Modules `.mjs`) |
| Framework | Express 5 |
| Base de datos | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Auth (JWT verificado en el backend) |
| Deploy | Vercel (serverless) |

---

## Estructura

```
berlini-backend/
├── index.mjs               # Entry point: Express, CORS, middleware, rutas
└── modulos/
    ├── rutas.mjs            # Definición de todos los endpoints
    ├── controlador.mjs      # Handlers HTTP (valida input, llama al modelo)
    ├── modelo.mjs           # Queries a Supabase
    └── supabaseClient.mjs   # Instancia del cliente con service_role
```

---

## Setup local

```bash
npm install
```

Crear `.env` en la raíz (nunca commitear):

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_BUCKET_NAME=productos-imagenes
```

```bash
npm run dev   # corre en http://localhost:3000
```

En Vercel las mismas variables se agregan en **Settings > Environment Variables**.

---

## Autenticación

Los endpoints de **lectura** y **creación de órdenes** son **públicos** (sin auth).  
Los endpoints de **escritura del admin** requieren el JWT de Supabase en el header:

```
Authorization: Bearer <token>
```

El token lo genera Supabase Auth al hacer login desde el frontend. El middleware `requireAuth` lo verifica antes de ejecutar el handler.

---

## Endpoints

### Productos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/productos` | — | Listar todos |
| `GET` | `/api/v1/productos/:id` | — | Obtener uno |
| `POST` | `/api/v1/productos` | ✅ JWT | Crear |
| `PUT` | `/api/v1/productos/:id` | ✅ JWT | Modificar |
| `DELETE` | `/api/v1/productos/:id` | ✅ JWT | Eliminar |

**Body POST / PUT:**
```json
{
  "nombre": "Ravioles de ricota",
  "detalle": "Hechos a mano",
  "precio": 1500,
  "stock": 40,
  "imagen_url": "https://...",
  "categoria": "Pastas"
}
```

---

### Extras

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/extras` | — | Listar todos |
| `GET` | `/api/v1/extras/:id` | — | Obtener uno |
| `POST` | `/api/v1/extras` | ✅ JWT | Crear |
| `PUT` | `/api/v1/extras/:id` | ✅ JWT | Modificar |
| `DELETE` | `/api/v1/extras/:id` | ✅ JWT | Eliminar |

**Body POST / PUT:**
```json
{
  "nombre": "Bolognesa",
  "precio": 500,
  "stock": 80
}
```

---

### Categorías

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/categorias` | — | Listar todas |

---

### Órdenes

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/ordenes` | ✅ JWT | Listar todas |
| `GET` | `/api/v1/ordenes/:id` | ✅ JWT | Obtener una |
| `POST` | `/api/v1/ordenes` | — | Crear (checkout público) |
| `PUT` | `/api/v1/ordenes/:id` | ✅ JWT | Cambiar estado |
| `DELETE` | `/api/v1/ordenes/:id` | ✅ JWT | Eliminar |

**Body POST (checkout):**
```json
{
  "nombre_cliente": "Juan Pérez",
  "telefono": "3511234567",
  "direccion": "Av. Colón 1234",
  "notas": "Sin sal",
  "metodo_pago": "efectivo",
  "metodo_entrega": "domicilio",
  "items": [
    { "id": 1, "nombre": "Ravioles", "precio": 1500, "cantidad": 2, "tipo": "producto" },
    { "id": 2, "nombre": "Bolognesa", "precio": 500,  "cantidad": 1, "tipo": "extra"   }
  ],
  "total": 3500
}
```

**Body PUT (cambio de estado):**
```json
{ "estado": "en_proceso" }
```

Estados válidos: `pendiente` | `en_proceso` | `listo` | `entregado` | `cancelado`

---

### Stock

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/descontar-stock` | — | Descuenta stock de varios ítems |

**Body:**
```json
[
  { "id": 1, "type": "producto", "quantity": 2 },
  { "id": 3, "type": "extra",    "quantity": 1 }
]
```

Descuenta en `productos` o `extras` según el campo `type`. Si el stock es insuficiente retorna 500 con el detalle del ítem.

---

### Imágenes (Supabase Storage)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/productos/upload-image` | ✅ JWT | Sube imagen al bucket |
| `DELETE` | `/api/v1/productos/delete-image` | ✅ JWT | Elimina imagen del bucket |

**Upload — `multipart/form-data`**, campo `image` (archivo).

**Respuesta upload (200):**
```json
{ "mensaje": "Imagen subida con éxito", "imageUrl": "https://...supabase.co/storage/..." }
```

**Delete — body JSON:**
```json
{ "imageUrl": "https://...supabase.co/storage/..." }
```

---

## Códigos de respuesta

| Código | Significado |
|---|---|
| 200 | OK |
| 201 | Recurso creado |
| 400 | Datos inválidos o faltantes |
| 401 | JWT ausente o inválido |
| 404 | Recurso no encontrado |
| 500 | Error interno / stock insuficiente |

---

## CORS

Los orígenes permitidos están en `ALLOWED_ORIGINS` dentro de `index.mjs`.  
Al adaptar a otro dominio, agregar el nuevo origen ahí antes de hacer deploy.

---

## Deploy en Vercel

El archivo `vercel.json` ya está configurado. Solo hay que:

1. Conectar el repo en [vercel.com](https://vercel.com)
2. Agregar las 3 variables en **Settings > Environment Variables**
3. Hacer push — Vercel despliega automáticamente

URL base de producción: `https://tu-proyecto.vercel.app/api/v1/`

---

## Errores frecuentes

| Error | Causa | Fix |
|---|---|---|
| CORS bloqueado | Dominio no está en `ALLOWED_ORIGINS` | Agregar el origen exacto en `index.mjs` |
| 401 Unauthorized | JWT expirado o header mal formado | Volver a hacer login en el frontend |
| 413 al subir imagen | Archivo > 5 MB | Comprimir antes de subir |
| Variables no definidas | `.env` no existe o Vercel sin vars | Crear `.env` / configurar en Vercel |