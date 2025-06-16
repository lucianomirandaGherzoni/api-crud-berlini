// modulos/data/controlador.mjs

import modelo from './modelo.mjs'; // Importa el modelo de productos (que ahora interactúa con PostgreSQL)

// Función para manejar la solicitud de obtener todos los productos
async function obtenerProductos(req, res) {
    try {
        const productos = await modelo.obtenerProductos();
        // Si no hay productos, el modelo devuelve un array vacío, lo manejamos con un 200 OK y un mensaje informativo.
        // No hay necesidad de un 404 aquí, ya que una colección vacía no es un error de "no encontrado".
        if (productos.length === 0) {
            return res.status(200).json({ mensaje: "No hay productos en la base de datos." });
        }
        res.status(200).json(productos);
    } catch (error) {
        console.error("Error en controlador.obtenerProductos:", error);
        // Envía un 500 con un mensaje de error y el detalle (solo en desarrollo)
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
            res.status(200).json(producto); // Usa res.json() para enviar el objeto JSON
        } else {
            // Si el modelo devuelve null, significa que el producto no fue encontrado
            res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }
    } catch (error) {
        console.error(`Error en controlador.obtenerUnProducto (ID: ${productoId}):`, error);
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener el producto.', detalle: error.message });
    }
}

// Función para agregar un producto
async function agregarUnProducto(req, res) { // Mantengo el nombre original de tu función
    try {
        const nuevoProducto = req.body;
        // Validación de datos de entrada
        if (!nuevoProducto.nombre || !nuevoProducto.marca || typeof nuevoProducto.precio === 'undefined' || typeof nuevoProducto.stock === 'undefined') {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios para el producto (nombre, marca, precio, stock)." });
        }
        if (isNaN(nuevoProducto.precio) || isNaN(nuevoProducto.stock)) {
            return res.status(400).json({ mensaje: "Precio y stock deben ser valores numéricos." });
        }

        const productoCreado = await modelo.agregarProducto(nuevoProducto); // Llama a la función del modelo
        // Envía una respuesta 201 Created para indicar que el recurso se creó con éxito
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
        if (!productoModificado.nombre || !productoModificado.marca || typeof productoModificado.precio === 'undefined' || typeof productoModificado.stock === 'undefined') {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios para modificar el producto (nombre, marca, precio, stock)." });
        }
        if (isNaN(productoModificado.precio) || isNaN(productoModificado.stock)) {
            return res.status(400).json({ mensaje: "Precio y stock deben ser valores numéricos." });
        }

        // Primero, verificar si el producto existe antes de intentar modificar
        const productoExistente = await modelo.obtenerUnProducto(productoId);
        if (!productoExistente) {
            return res.status(404).json({ mensaje: "Producto a modificar no encontrado." });
        }

        const modificado = await modelo.modificarProducto(productoId, productoModificado);
        if (modificado) {
            // Si el modelo retorna true (indicando éxito), envía un mensaje claro
            res.status(200).json({ mensaje: `Producto con ID ${productoId} modificado con éxito.` });
        } else {
            // Este else es más un fallback, ya que si productoExistente pasó, debería modificarse.
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
        const eliminado = await modelo.eliminarProducto(productoId);
        if (eliminado) {
            // 200 OK con un mensaje o 204 No Content si no se devuelve nada.
            res.status(200).json({ mensaje: `Producto con ID ${productoId} eliminado con éxito.` });
        } else {
            // Si el modelo retorna false, el producto no fue encontrado para eliminar
            res.status(404).json({ mensaje: 'Producto no encontrado para eliminar.' });
        }
    } catch (error) {
        console.error(`Error en controlador.eliminarProducto (ID: ${productoId}):`, error);
        res.status(500).json({ mensaje: 'Error interno del servidor al eliminar el producto.', detalle: error.message });
    }
}

// Exportamos las funciones del controlador
export default {
    obtenerProductos,
    obtenerUnProducto,
    agregarUnProducto, // Exportamos con el nombre original de tu función
    modificarProducto,
    eliminarProducto,
};