// modulos/controlador.mjs

import modelo from './modelo.mjs'; // Importa el modelo de productos

// Función para manejar la solicitud de obtener todos los productos
async function obtenerProductos(req, res) {
    try {
        const productos = await modelo.obtenerProductos();
        if (productos.length === 0) {
            return res.status(200).json({ mensaje: "No hay productos en la base de datos." });
        }
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error interno del servidor al obtener productos.", detalle: error.message });
    }
}

// Función que retorna un producto por ID
async function obtenerUnProducto(req, res) {
    const productoId = parseInt(req.params.id);

    if (isNaN(productoId)) {
        return res.status(400).json({ mensaje: 'ID de producto inválido. Debe ser un número.' });
    }

    try {
        const producto = await modelo.obtenerUnProducto(productoId);
        if (producto) {
            res.status(200).json(producto);
        } else {
            res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener el producto.', detalle: error.message });
    }
}

// Función para agregar un producto
async function agregarUnProducto(req, res) {
    try {
        const nuevoProducto = req.body;
        // Validación de datos de entrada
        // AÑADIR 'categoria' a la validación
        if (!nuevoProducto.nombre || !nuevoProducto.detalle || typeof nuevoProducto.precio === 'undefined' || typeof nuevoProducto.stock === 'undefined' || !nuevoProducto.categoria) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios para el producto (nombre, detalle, precio, stock, categoria)." });
        }
        if (isNaN(nuevoProducto.precio) || isNaN(nuevoProducto.stock)) {
            return res.status(400).json({ mensaje: "Precio y stock deben ser valores numéricos." });
        }

        const productoCreado = await modelo.agregarProducto(nuevoProducto);
        res.status(201).json({ mensaje: "Producto agregado con éxito", producto: productoCreado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor al agregar el producto.', detalle: error.message });
    }
}

// Función para modificar un producto
async function modificarProducto(req, res) {
    try {
        const productoId = parseInt(req.params.id);
        const productoModificado = req.body;

        if (isNaN(productoId)) {
            return res.status(400).json({ mensaje: 'ID de producto inválido. Debe ser un número.' });
        }

        // Validación de datos de entrada para la modificación
        // AÑADIR 'categoria' a la validación
        if (!productoModificado.nombre || !productoModificado.detalle || typeof productoModificado.precio === 'undefined' || typeof productoModificado.stock === 'undefined' || !productoModificado.categoria) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios para modificar el producto (nombre, detalle, precio, stock, categoria)." });
        }
        if (isNaN(productoModificado.precio) || isNaN(productoModificado.stock)) {
            return res.status(400).json({ mensaje: "Precio y stock deben ser valores numéricos." });
        }

        const productoExistente = await modelo.obtenerUnProducto(productoId);
        if (!productoExistente) {
            return res.status(404).json({ mensaje: "Producto a modificar no encontrado." });
        }
        
        // --- Lógica añadida para la eliminación de imagen antigua ---
        const imagenUrlAntigua = productoExistente.imagen_url;
        const imagenUrlNueva = productoModificado.imagen_url;
        // -----------------------------------------------------------

        const modificado = await modelo.modificarProducto(productoId, productoModificado);
        if (modificado) {
            
            // --- Eliminación de imagen antigua después de modificar el producto ---
            // Solo eliminar si existía una imagen antigua Y la nueva URL es diferente.
            if (imagenUrlAntigua && imagenUrlAntigua !== imagenUrlNueva) {
                await modelo.eliminarImagenStorage(imagenUrlAntigua);
            }
            // ---------------------------------------------------------------------

            res.status(200).json({ mensaje: `Producto con ID ${productoId} modificado con éxito.` });
        } else {
            res.status(500).json({ mensaje: 'No se pudo modificar el producto por una razón desconocida.' });
        }

    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor al modificar el producto.', detalle: error.message });
    }
}

// Función para eliminar 1 producto
async function eliminarProducto(req, res) {
    const productoId = parseInt(req.params.id);

    if (isNaN(productoId)) {
        return res.status(400).json({ mensaje: 'ID de producto inválido. Debe ser un número.' });
    }

    try {
        // Antes de eliminar el producto de la BD, obtener su URL de imagen para eliminarla del storage
        const productoAEliminar = await modelo.obtenerUnProducto(productoId);
        if (productoAEliminar && productoAEliminar.imagen_url) {
            await modelo.eliminarImagenStorage(productoAEliminar.imagen_url);
        }

        const eliminado = await modelo.eliminarProducto(productoId);
        if (eliminado) {
            res.status(200).json({ mensaje: `Producto con ID ${productoId} eliminado con éxito.` });
        } else {
            res.status(404).json({ mensaje: 'Producto no encontrado para eliminar.' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor al eliminar el producto.', detalle: error.message });
    }
}

// --- Nuevas funciones del controlador para manejo de imágenes ---

async function subirImagen(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ mensaje: 'No se ha proporcionado ningún archivo de imagen.' });
        }

        // req.file.buffer contiene el archivo en memoria
        // req.file.originalname contiene el nombre original del archivo
        const imageUrl = await modelo.subirImagenStorage(req.file.buffer, req.file); // Pasar el objeto file completo para mimetype

        res.status(200).json({ mensaje: 'Imagen subida con éxito', imageUrl: imageUrl });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor al subir la imagen.', detalle: error.message });
    }
}

async function eliminarImagen(req, res) {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ mensaje: 'No se ha proporcionado la URL de la imagen a eliminar.' });
        }

        await modelo.eliminarImagenStorage(imageUrl);
        res.status(200).json({ mensaje: 'Imagen eliminada con éxito.' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor al eliminar la imagen.', detalle: error.message });
    }
}

// funciones del controlador para el manejo de salsas 
// Función para obtener todas las salsas
async function obtenerSalsas(req, res) {
    try {
        const salsas = await modelo.obtenerSalsas();
        if (salsas.length === 0) {
            return res.status(200).json({ mensaje: "No hay salsas en la base de datos." });
        }
        res.status(200).json(salsas);
    } catch (error) {
        res.status(500).json({ mensaje: "Error interno del servidor al obtener salsas.", detalle: error.message });
    }
}

// Función que retorna una salsa por ID
async function obtenerUnaSalsa(req, res) {
    const salsaId = parseInt(req.params.id);

    if (isNaN(salsaId)) {
        return res.status(400).json({ mensaje: 'ID de salsa inválido. Debe ser un número.' });
    }

    try {
        const salsa = await modelo.obtenerUnaSalsa(salsaId);
        if (salsa) {
            res.status(200).json(salsa);
        } else {
            res.status(404).json({ mensaje: 'Salsa no encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener la salsa.', detalle: error.message });
    }
}

// Función para agregar una nueva salsa
async function agregarUnaSalsa(req, res) {
    try {
        const nuevaSalsa = req.body;
        // Validación de datos de entrada según los campos de tu tabla "salsas"
        if (!nuevaSalsa.salsa_nombre || typeof nuevaSalsa.salsa_precio === 'undefined' || typeof nuevaSalsa.salsa_stock === 'undefined') {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios para la salsa (salsa_nombre, salsa_precio, salsa_stock)." });
        }
        if (isNaN(nuevaSalsa.salsa_precio) || isNaN(nuevaSalsa.salsa_stock)) {
            return res.status(400).json({ mensaje: "Precio y stock de salsa deben ser valores numéricos." });
        }

        const salsaCreada = await modelo.agregarSalsa(nuevaSalsa);
        res.status(201).json({ mensaje: "Salsa agregada con éxito", salsa: salsaCreada });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor al agregar la salsa.', detalle: error.message });
    }
}

// Función para modificar una salsa
async function modificarSalsa(req, res) {
    try {
        const salsaId = parseInt(req.params.id);
        const salsaModificada = req.body;

        if (isNaN(salsaId)) {
            return res.status(400).json({ mensaje: 'ID de salsa inválido. Debe ser un número.' });
        }

        // Validación de datos de entrada para la modificación
        if (!salsaModificada.salsa_nombre || typeof salsaModificada.salsa_precio === 'undefined' || typeof salsaModificada.salsa_stock === 'undefined') {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios para modificar la salsa (salsa_nombre, salsa_precio, salsa_stock)." });
        }
        if (isNaN(salsaModificada.salsa_precio) || isNaN(salsaModificada.salsa_stock)) {
            return res.status(400).json({ mensaje: "Precio y stock de salsa deben ser valores numéricos." });
        }

        const salsaExistente = await modelo.obtenerUnaSalsa(salsaId);
        if (!salsaExistente) {
            return res.status(404).json({ mensaje: "Salsa a modificar no encontrada." });
        }

        const modificado = await modelo.modificarSalsa(salsaId, salsaModificada);
        if (modificado) {
            res.status(200).json({ mensaje: `Salsa con ID ${salsaId} modificada con éxito.` });
        } else {
            res.status(500).json({ mensaje: 'No se pudo modificar la salsa por una razón desconocida.' });
        }

    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor al modificar la salsa.', detalle: error.message });
    }
}

// Función para eliminar una salsa
async function eliminarSalsa(req, res) {
    const salsaId = parseInt(req.params.id);

    if (isNaN(salsaId)) {
        return res.status(400).json({ mensaje: 'ID de salsa inválido. Debe ser un número.' });
    }

    try {
        const eliminado = await modelo.eliminarSalsa(salsaId);
        if (eliminado) {
            res.status(200).json({ mensaje: `Salsa con ID ${salsaId} eliminada con éxito.` });
        } else {
            res.status(404).json({ mensaje: 'Salsa no encontrada para eliminar.' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno del servidor al eliminar la salsa.', detalle: error.message });
    }
}


// Función para manejar el descuento de stock
async function descontarStock(req, res) {
    const items = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ mensaje: 'El cuerpo de la solicitud debe ser un array de ítems.' });
    }

    try {
        await modelo.descontarStock(items);
        res.status(200).json({ mensaje: 'Stock descontado con éxito.' });
    } catch (error) {
        // En caso de error (por ejemplo, stock insuficiente), envía una respuesta clara al cliente
        res.status(500).json({ mensaje: 'Error al procesar el pedido. ' + error.message });
    }
}



// ─── CATEGORÍAS ───────────────────────────────

async function obtenerCategorias(req, res) {
    try {
        const categorias = await modelo.obtenerCategorias();
        res.status(200).json(categorias);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener categorías.', detalle: error.message });
    }
}

async function obtenerUnaCategoria(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido.' });
    try {
        const cat = await modelo.obtenerUnaCategoria(id);
        if (!cat) return res.status(404).json({ mensaje: 'Categoría no encontrada.' });
        res.status(200).json(cat);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener categoría.', detalle: error.message });
    }
}

async function agregarCategoria(req, res) {
    const { nombre, slug, descripcion } = req.body;
    if (!nombre || !slug) {
        return res.status(400).json({ mensaje: 'nombre y slug son obligatorios.' });
    }
    if (!/^[a-z0-9_-]+$/.test(slug)) {
        return res.status(400).json({ mensaje: 'El slug solo puede contener minúsculas, números, guión (-) o guión bajo (_).' });
    }
    try {
        const nueva = await modelo.agregarCategoria({ nombre, slug, descripcion });
        res.status(201).json({ mensaje: 'Categoría creada con éxito.', categoria: nueva });
    } catch (error) {
        // Slug duplicado → Supabase lanza código 23505
        if (error.message.includes('23505') || error.message.includes('unique')) {
            return res.status(409).json({ mensaje: `El slug "${slug}" ya existe.` });
        }
        res.status(500).json({ mensaje: 'Error al crear categoría.', detalle: error.message });
    }
}

async function modificarCategoria(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido.' });
    const { nombre, slug, descripcion } = req.body;
    if (!nombre || !slug) {
        return res.status(400).json({ mensaje: 'nombre y slug son obligatorios.' });
    }
    if (!/^[a-z0-9_-]+$/.test(slug)) {
        return res.status(400).json({ mensaje: 'Slug inválido.' });
    }
    try {
        const existe = await modelo.obtenerUnaCategoria(id);
        if (!existe) return res.status(404).json({ mensaje: 'Categoría no encontrada.' });
        await modelo.modificarCategoria(id, { nombre, slug, descripcion });
        res.status(200).json({ mensaje: `Categoría ${id} modificada con éxito.` });
    } catch (error) {
        if (error.message.includes('23505') || error.message.includes('unique')) {
            return res.status(409).json({ mensaje: `El slug "${slug}" ya está en uso.` });
        }
        res.status(500).json({ mensaje: 'Error al modificar categoría.', detalle: error.message });
    }
}

async function eliminarCategoria(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido.' });
    try {
        await modelo.eliminarCategoria(id);
        res.status(200).json({ mensaje: `Categoría ${id} eliminada con éxito.` });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar categoría.', detalle: error.message });
    }
}

// ─── ÓRDENES ──────────────────────────────────

async function obtenerOrdenes(req, res) {
    try {
        const ordenes = await modelo.obtenerOrdenes();
        res.status(200).json(ordenes);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener órdenes.', detalle: error.message });
    }
}

async function obtenerUnaOrden(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido.' });
    try {
        const orden = await modelo.obtenerUnaOrden(id);
        if (!orden) return res.status(404).json({ mensaje: 'Orden no encontrada.' });
        res.status(200).json(orden);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener orden.', detalle: error.message });
    }
}

async function crearOrden(req, res) {
    const { nombre_cliente, telefono, direccion, metodo_pago, notas, total, items } = req.body;
    if (!nombre_cliente || typeof total === 'undefined' || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios: nombre_cliente, total, items[].' });
    }
    if (isNaN(Number(total)) || Number(total) < 0) {
        return res.status(400).json({ mensaje: 'El total debe ser un número positivo.' });
    }
    try {
        const nueva = await modelo.crearOrden({ nombre_cliente, telefono, direccion, metodo_pago, notas, total: Number(total), items });
        res.status(201).json({ mensaje: 'Orden creada con éxito.', orden: nueva });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear orden.', detalle: error.message });
    }
}

async function actualizarEstadoOrden(req, res) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ mensaje: 'ID inválido.' });
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ mensaje: 'El campo "estado" es obligatorio.' });
    try {
        const orden = await modelo.obtenerUnaOrden(id);
        if (!orden) return res.status(404).json({ mensaje: 'Orden no encontrada.' });
        const actualizada = await modelo.actualizarEstadoOrden(id, estado);
        res.status(200).json({ mensaje: 'Estado actualizado.', orden: actualizada });
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
}

export default {
    obtenerProductos,
    obtenerUnProducto,
    agregarUnProducto,
    modificarProducto,
    eliminarProducto,
    subirImagen,
    eliminarImagen,
    obtenerSalsas,
    obtenerUnaSalsa,
    agregarUnaSalsa,
    modificarSalsa,
    eliminarSalsa,
    descontarStock,

    // Categorías
    obtenerCategorias,
    obtenerUnaCategoria,
    agregarCategoria,
    modificarCategoria,
    eliminarCategoria,

    // Órdenes
    obtenerOrdenes,
    obtenerUnaOrden,
    crearOrden,
    actualizarEstadoOrden,
};
    subirImagen, // Exportar la nueva función
    eliminarImagen, // Exportar la nueva función
    /* exportar crud-controlador de salsas */
    obtenerSalsas,
    obtenerUnaSalsa,
    agregarUnaSalsa,
    modificarSalsa,
    eliminarSalsa,
    descontarStock // Agrega la nueva función aquí
};