import {Router} from 'express';
import controlador from './controlador.mjs';
const rutasApi = Router();

rutasApi.get('/api/v1/productos', controlador.obtenerProductos)
rutasApi.get('/api/v1/productos/:id', controlador.obtenerUnProducto)
rutasApi.post('/api/v1/productos', controlador.agregarUnProducto)
rutasApi.put('/api/v1/productos/:id', controlador.modificarProducto)
rutasApi.delete('/api/v1/productos/:id', controlador.eliminarProducto)

export default rutasApi;