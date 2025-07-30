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
        console.error("Error en controlador.obtenerProductos:", error);
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
        console.error(`Error en controlador.obtenerUnProducto (ID: ${productoId}):`, error);
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
        console.error("Error en controlador.agregarUnProducto:", error);
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

        const modificado = await modelo.modificarProducto(productoId, productoModificado);
        if (modificado) {
            res.status(200).json({ mensaje: `Producto con ID ${productoId} modificado con éxito.` });
        } else {
            res.status(500).json({ mensaje: 'No se pudo modificar el producto por una razón desconocida.' });
        }

    } catch (error) {
        console.error(`Error en controlador.modificarProducto (ID: ${req.params.id}):`, error);
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
        console.error(`Error en controlador.eliminarProducto (ID: ${productoId}):`, error);
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
        console.error("Error en controlador.subirImagen:", error);
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
        console.error("Error en controlador.eliminarImagen:", error);
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
        console.error("Error en controladorSalsas.obtenerSalsas:", error);
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
        console.error(`Error en controladorSalsas.obtenerUnaSalsa (ID: ${salsaId}):`, error);
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
        console.error("Error en controladorSalsas.agregarUnaSalsa:", error);
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
        console.error(`Error en controladorSalsas.modificarSalsa (ID: ${req.params.id}):`, error);
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
        console.error(`Error en controladorSalsas.eliminarSalsa (ID: ${salsaId}):`, error);
        res.status(500).json({ mensaje: 'Error interno del servidor al eliminar la salsa.', detalle: error.message });
    }
}


// Exportamos las funciones del controlador
export default {
    obtenerProductos,
    obtenerUnProducto,
    agregarUnProducto,
    modificarProducto,
    eliminarProducto,
    subirImagen, // Exportar la nueva función
    eliminarImagen, // Exportar la nueva función
    /* exportar crud-controlador de salsas */
    obtenerSalsas,
    obtenerUnaSalsa,
    agregarUnaSalsa,
    modificarSalsa,
    eliminarSalsa,
};
