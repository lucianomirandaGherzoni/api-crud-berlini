import { Router } from 'express';
import controlador from './controlador.mjs';
import multer from 'multer';
import { requireAuth } from './middleware.mjs';

const rutasApi = Router();

// Multer con límite de 5MB por imagen
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Productos (lectura pública, escritura protegida) ──────────────────────
rutasApi.get('/api/v1/productos',              controlador.obtenerProductos);
rutasApi.get('/api/v1/productos/:id',          controlador.obtenerUnProducto);
rutasApi.post('/api/v1/productos',             requireAuth, controlador.agregarUnProducto);
rutasApi.put('/api/v1/productos/:id',          requireAuth, controlador.modificarProducto);
rutasApi.delete('/api/v1/productos/:id',       requireAuth, controlador.eliminarProducto);
rutasApi.post('/api/v1/productos/upload-image', requireAuth, upload.single('image'), controlador.subirImagen);
rutasApi.delete('/api/v1/productos/delete-image', requireAuth, controlador.eliminarImagen);

// ─── Salsas ───────────────────────────────────────────────────────────────
rutasApi.get('/api/v1/salsas',                 controlador.obtenerSalsas);
rutasApi.get('/api/v1/salsas/:id',             controlador.obtenerUnaSalsa);
rutasApi.post('/api/v1/salsas',                requireAuth, controlador.agregarUnaSalsa);
rutasApi.put('/api/v1/salsas/:id',             requireAuth, controlador.modificarSalsa);
rutasApi.delete('/api/v1/salsas/:id',          requireAuth, controlador.eliminarSalsa);

// ─── Descuento de stock (público, llamado desde el checkout del cliente) ──
rutasApi.post('/api/v1/descontar-stock',       controlador.descontarStock);

// ─── Categorías ───────────────────────────────────────────────────────────
rutasApi.get('/api/v1/categorias',             controlador.obtenerCategorias);
rutasApi.get('/api/v1/categorias/:id',         controlador.obtenerUnaCategoria);
rutasApi.post('/api/v1/categorias',            requireAuth, controlador.agregarCategoria);
rutasApi.put('/api/v1/categorias/:id',         requireAuth, controlador.modificarCategoria);
rutasApi.delete('/api/v1/categorias/:id',      requireAuth, controlador.eliminarCategoria);

// ─── Órdenes (crear es público, leer/actualizar requiere auth) ────────────
rutasApi.post('/api/v1/ordenes',               controlador.crearOrden);
rutasApi.get('/api/v1/ordenes',                requireAuth, controlador.obtenerOrdenes);
rutasApi.get('/api/v1/ordenes/:id',            requireAuth, controlador.obtenerUnaOrden);
rutasApi.patch('/api/v1/ordenes/:id',          requireAuth, controlador.actualizarEstadoOrden);

// ─── Admin ────────────────────────────────────────────────────────────────
rutasApi.post('/api/v1/admin/invitar',         requireAuth, controlador.invitarAdmin);

export default rutasApi;
