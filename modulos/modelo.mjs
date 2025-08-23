// modulos/modelo.mjs
import { supabaseAdmin } from './supabaseClient.mjs'; // Importa el cliente Supabase con service_role

// Función para obtener todos los productos
async function obtenerProductos() {
    try {
        const { data: productos, error } = await supabaseAdmin
            .from('productos')
            // AÑADIR 'categoria' aquí
            .select('id, nombre, detalle, precio, stock, imagen_url, categoria')
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }
        return productos;
    } catch (error) {
        console.error("Error al obtener productos:", error.message);
        throw error;
    }
}

// Función para obtener un producto por ID
async function obtenerUnProducto(id) {
    try {
        const { data: producto, error } = await supabaseAdmin
            .from('productos')
            .select('id, nombre, detalle, precio, stock, imagen_url, categoria')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }
        return producto;
    } catch (error) {
        console.error(`Error al obtener producto con ID ${id}:`, error.message);
        throw error;
    }
}

// Función para agregar un producto
async function agregarProducto(nuevoProducto) {
    try {
        // AÑADIR 'categoria' aquí
        const { nombre, detalle, precio, stock, imagen_url, categoria } = nuevoProducto;

        const { data, error } = await supabaseAdmin
            .from('productos')
            .insert([
                {
                    nombre: nombre,
                    detalle: detalle,
                    precio: precio,
                    stock: stock,
                    imagen_url: imagen_url,
                    categoria: categoria
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error al agregar producto en Supabase:", error);
            throw new Error(`Error al agregar producto: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error("Error en modelo.agregarProducto:", error);
        throw error;
    }
}

// Función para modificar un producto
async function modificarProducto(id, productoModificar) {
    try {
        // AÑADIR 'categoria' aquí
        const { nombre, detalle, precio, stock, imagen_url, categoria } = productoModificar;

        const { data, error } = await supabaseAdmin
            .from('productos')
            .update({
                nombre: nombre,
                detalle: detalle,
                precio: precio,
                stock: stock,
                imagen_url: imagen_url,
                // AÑADIR 'categoria' aquí
                categoria: categoria
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error al modificar producto con ID ${id} en Supabase:`, error);
            throw new Error(`Error al modificar producto: ${error.message}`);
        }

        return data !== null;
    } catch (error) {
        console.error(`Error en modelo.modificarProducto (ID: ${id}):`, error);
        throw error;
    }
}

// Función para eliminar un producto
async function eliminarProducto(id) {
    try {
        const { error, count } = await supabaseAdmin // Usar supabaseAdmin
            .from('productos') // Nombre de tu tabla en Supabase
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error al eliminar producto con ID ${id} en Supabase:`, error);
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }

        return count > 0;
    } catch (error) {
        console.error(`Error en modelo.eliminarProducto (ID: ${id}):`, error);
        throw error;
    }
}

// --- Nuevas funciones para Supabase Storage ---

// Función para subir una imagen a Supabase Storage
async function subirImagenStorage(fileBuffer, originalFile) { // Cambiado a originalFile para acceder a mimetype
    try {
        const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'productos-imagenes'; // Asegúrate de que esta variable de entorno esté configurada
        const fileExt = originalFile.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`; // Nombre único
        const filePath = `${fileName}`; // Ruta dentro del bucket

        const { data, error } = await supabaseAdmin.storage
            .from(SUPABASE_BUCKET_NAME)
            .upload(filePath, fileBuffer, {
                contentType: originalFile.mimetype, // Usar el mimetype original del archivo
                upsert: false // No sobrescribir si ya existe
            });

        if (error) {
            console.error("Error al subir imagen a Supabase Storage:", error);
            throw new Error(`Error al subir imagen: ${error.message}`);
        }

        // Obtener la URL pública de la imagen
        const { data: publicUrlData } = supabaseAdmin.storage
            .from(SUPABASE_BUCKET_NAME)
            .getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
            return publicUrlData.publicUrl;
        } else {
            throw new Error("No se pudo obtener la URL pública de la imagen.");
        }

    } catch (error) {
        console.error("Error en modelo.subirImagenStorage:", error);
        throw error;
    }
}

// Función para eliminar una imagen de Supabase Storage
async function eliminarImagenStorage(imageUrl) {
    if (!imageUrl) return;

    try {
        const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'productos-imagenes';
        // Extraer el path del archivo de la URL pública de Supabase
        // Ejemplo de URL: https://<project_id>.supabase.co/storage/v1/object/public/bucket_name/path/to/file.jpg
        const urlParts = imageUrl.split('/');
        const bucketIndex = urlParts.indexOf(SUPABASE_BUCKET_NAME);
        if (bucketIndex === -1 || bucketIndex + 1 >= urlParts.length) {
            console.warn("No se pudo parsear la URL de la imagen para eliminar:", imageUrl);
            return; // No se puede eliminar si la URL no es válida
        }
        const filePathInBucket = urlParts.slice(bucketIndex + 1).join('/');

        const { error } = await supabaseAdmin.storage
            .from(SUPABASE_BUCKET_NAME)
            .remove([filePathInBucket]);

        if (error) {
            console.warn("Error al eliminar imagen de Supabase Storage:", error.message);
        } else {
            console.log(`Imagen ${filePathInBucket} eliminada de Supabase Storage.`);
        }
    } catch (error) {
        console.warn("Error en modelo.eliminarImagenStorage:", error);
    }
}

// --- Nuevas funciones para Salsas ---

// Función para obtener todas las salsas
async function obtenerSalsas() {
    try {
        const { data: salsas, error } = await supabaseAdmin
            .from('salsas') // Usar la tabla 'salsas'
            .select('id, salsa_nombre, salsa_precio, salsa_stock') // Campos de la tabla 'salsas'
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }
        return salsas;
    } catch (error) {
        console.error("Error al obtener salsas:", error.message);
        throw error;
    }
}

// Función para obtener una salsa por ID
async function obtenerUnaSalsa(id) {
    try {
        const { data: salsa, error } = await supabaseAdmin
            .from('salsas') // Usar la tabla 'salsas'
            .select('id, salsa_nombre, salsa_precio, salsa_stock') // Campos de la tabla 'salsas'
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }
        return salsa;
    } catch (error) {
        console.error(`Error al obtener salsa con ID ${id}:`, error.message);
        throw error;
    }
}

// Función para agregar una salsa
async function agregarSalsa(nuevaSalsa) {
    try {
        const { salsa_nombre, salsa_precio, salsa_stock } = nuevaSalsa; // Campos de la tabla 'salsas'

        const { data, error } = await supabaseAdmin
            .from('salsas') // Usar la tabla 'salsas'
            .insert([
                {
                    salsa_nombre: salsa_nombre,
                    salsa_precio: salsa_precio,
                    salsa_stock: salsa_stock
                }
            ])
            .select()
            .single();

        if (error) {
            console.error("Error al agregar salsa en Supabase:", error);
            throw new Error(`Error al agregar salsa: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error("Error en modelo.agregarSalsa:", error);
        throw error;
    }
}

// Función para modificar una salsa
async function modificarSalsa(id, salsaModificar) {
    try {
        const { salsa_nombre, salsa_precio, salsa_stock } = salsaModificar; // Campos de la tabla 'salsas'

        const { data, error } = await supabaseAdmin
            .from('salsas') // Usar la tabla 'salsas'
            .update({
                salsa_nombre: salsa_nombre,
                salsa_precio: salsa_precio,
                salsa_stock: salsa_stock
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error al modificar salsa con ID ${id} en Supabase:`, error);
            throw new Error(`Error al modificar salsa: ${error.message}`);
        }

        return data !== null;
    } catch (error) {
        console.error(`Error en modelo.modificarSalsa (ID: ${id}):`, error);
        throw error;
    }
}

// Función para eliminar una salsa
async function eliminarSalsa(id) {
    try {
        const { error, count } = await supabaseAdmin
            .from('salsas') // Usar la tabla 'salsas'
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error al eliminar salsa con ID ${id} en Supabase:`, error);
            throw new Error(`Error al eliminar salsa: ${error.message}`);
        }

        return count > 0;
    } catch (error) {
        console.error(`Error en modelo.eliminarSalsa (ID: ${id}):`, error);
        throw error;
    }
}

// Función para descontar stock de múltiples ítems
async function descontarStock(items) {
    try {
        const updates = [];

        for (const item of items) {
            const { id, type, quantity } = item;

            // Determina la tabla y el campo de stock según el tipo
            const tableName = type === 'producto' ? 'productos' : 'salsas';
            const stockColumnName = type === 'producto' ? 'stock' : 'salsa_stock';

            // Primero, obtén el stock actual para asegurarte de que hay suficiente
            const { data, error: fetchError } = await supabaseAdmin
                .from(tableName)
                .select(stockColumnName)
                .eq('id', id)
                .single();

            if (fetchError) {
                throw new Error(`Error al obtener stock para ${type} ${id}: ${fetchError.message}`);
            }

            if (!data) {
                throw new Error(`${type} con ID ${id} no encontrado.`);
            }

            const currentStock = data[stockColumnName];
            const newStock = currentStock - quantity;

            // Valida que el stock no sea negativo
            if (newStock < 0) {
                throw new Error(`Stock insuficiente para ${type} con ID ${id}. Stock actual: ${currentStock}, Cantidad solicitada: ${quantity}`);
            }

            // Prepara la actualización
            const updatePromise = supabaseAdmin
                .from(tableName)
                .update({ [stockColumnName]: newStock })
                .eq('id', id);

            updates.push(updatePromise);
        }

        // Ejecuta todas las actualizaciones en paralelo
        const results = await Promise.all(updates);

        // Verifica si alguna de las promesas de actualización falló
        for (const result of results) {
            if (result.error) {
                throw new Error(`Error al actualizar stock: ${result.error.message}`);
            }
        }

        return true;
    } catch (error) {
        console.error("Error en modelo.descontarStock:", error.message);
        throw error;
    }
}



export default {
    obtenerProductos,
    obtenerUnProducto,
    agregarProducto,
    modificarProducto,
    eliminarProducto,
    subirImagenStorage, // Exportar la nueva función
    eliminarImagenStorage, // Exportar la nueva función

    // Exportaciones de salsas
    obtenerSalsas,
    obtenerUnaSalsa,
    agregarSalsa,
    modificarSalsa,
    eliminarSalsa,

    descontarStock,
};
