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
            throw new Error(`Error al agregar producto: ${error.message}`);
        }

        return data;
    } catch (error) {
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
            throw new Error(`Error al modificar producto: ${error.message}`);
        }

        return data !== null;
    } catch (error) {
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
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }

        return count > 0;
    } catch (error) {
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
            return; // No se puede eliminar si la URL no es válida
        }
        const filePathInBucket = urlParts.slice(bucketIndex + 1).join('/');

        const { error } = await supabaseAdmin.storage
            .from(SUPABASE_BUCKET_NAME)
            .remove([filePathInBucket]);

        if (error) {
            throw new Error(`Error al eliminar imagen: ${error.message}`);
        }
    } catch (error) {
        throw error;
    }
}

// --- Funciones para Extras ---

async function obtenerExtras() {
    try {
        const { data, error } = await supabaseAdmin
            .from('extras')
            .select('id, nombre, precio, stock')
            .order('id', { ascending: true });
        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
}

async function obtenerUnExtra(id) {
    try {
        const { data, error } = await supabaseAdmin
            .from('extras')
            .select('id, nombre, precio, stock')
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    } catch (error) {
        throw error;
    }
}

async function agregarExtra(nuevoExtra) {
    try {
        const { nombre, precio, stock } = nuevoExtra;
        const { data, error } = await supabaseAdmin
            .from('extras')
            .insert([{ nombre, precio, stock }])
            .select()
            .single();
        if (error) throw new Error(`Error al agregar extra: ${error.message}`);
        return data;
    } catch (error) {
        throw error;
    }
}

async function modificarExtra(id, extraModificar) {
    try {
        const { nombre, precio, stock } = extraModificar;
        const { data, error } = await supabaseAdmin
            .from('extras')
            .update({ nombre, precio, stock })
            .eq('id', id)
            .select()
            .single();
        if (error) throw new Error(`Error al modificar extra: ${error.message}`);
        return data !== null;
    } catch (error) {
        throw error;
    }
}

async function eliminarExtra(id) {
    try {
        const { error, count } = await supabaseAdmin
            .from('extras')
            .delete()
            .eq('id', id);
        if (error) throw new Error(`Error al eliminar extra: ${error.message}`);
        return count > 0;
    } catch (error) {
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
            const tableName = type === 'producto' ? 'productos' : 'extras';
            const stockColumnName = 'stock';

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
        throw error;
    }
}



// ─── CATEGORÍAS ───────────────────────────────

async function obtenerCategorias() {
    const { data, error } = await supabaseAdmin
        .from('categorias')
        .select('id, nombre, slug, descripcion')
        .order('id', { ascending: true });
    if (error) throw error;
    return data;
}

async function obtenerUnaCategoria(id) {
    const { data, error } = await supabaseAdmin
        .from('categorias')
        .select('id, nombre, slug, descripcion')
        .eq('id', id)
        .single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

async function agregarCategoria({ nombre, slug, descripcion }) {
    const { data, error } = await supabaseAdmin
        .from('categorias')
        .insert([{ nombre, slug, descripcion: descripcion || null }])
        .select()
        .single();
    if (error) throw new Error(`Error al agregar categoría: ${error.message}`);
    return data;
}

async function modificarCategoria(id, { nombre, slug, descripcion }) {
    const { data, error } = await supabaseAdmin
        .from('categorias')
        .update({ nombre, slug, descripcion: descripcion || null })
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(`Error al modificar categoría: ${error.message}`);
    return data !== null;
}

async function eliminarCategoria(id) {
    const { error, count } = await supabaseAdmin
        .from('categorias')
        .delete()
        .eq('id', id);
    if (error) throw new Error(`Error al eliminar categoría: ${error.message}`);
    return count > 0;
}

// ─── ÓRDENES ──────────────────────────────────

async function obtenerOrdenes() {
    const { data, error } = await supabaseAdmin
        .from('ordenes')
        .select('id, nombre_cliente, telefono, direccion, metodo_pago, notas, estado, total, items, created_at, updated_at')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

async function obtenerUnaOrden(id) {
    const { data, error } = await supabaseAdmin
        .from('ordenes')
        .select('id, nombre_cliente, telefono, direccion, metodo_pago, notas, estado, total, items, created_at, updated_at')
        .eq('id', id)
        .single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

async function crearOrden({ nombre_cliente, telefono, direccion, metodo_entrega, metodo_pago, notas, total, items }) {
    const { data, error } = await supabaseAdmin
        .from('ordenes')
        .insert([{
            nombre_cliente,
            telefono:        telefono        || null,
            direccion:       direccion       || null,
            metodo_entrega:  metodo_entrega  || 'domicilio',
            metodo_pago:     metodo_pago     || 'efectivo',
            notas:           notas           || null,
            total,
            items:           items           || [],
            estado:          'pendiente'
        }])
        .select()
        .single();
    if (error) throw new Error(`Error al crear orden: ${error.message}`);
    return data;
}

async function actualizarEstadoOrden(id, estado) {
    const ESTADOS_VALIDOS = ['pendiente', 'en_proceso', 'listo', 'entregado', 'cancelado'];
    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw new Error(`Estado inválido: "${estado}". Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }
    const { data, error } = await supabaseAdmin
        .from('ordenes')
        .update({ estado, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(`Error al actualizar estado: ${error.message}`);
    return data;
}

async function obtenerConfig() {
    const { data, error } = await supabaseAdmin
        .from('configuracion')
        .select('clave, valor');
    if (error) throw new Error(`Error al obtener config: ${error.message}`);
    // Devuelve objeto { clave: valor }
    return Object.fromEntries((data || []).map(r => [r.clave, r.valor]));
}

async function actualizarConfig(clave, valor) {
    const { data, error } = await supabaseAdmin
        .from('configuracion')
        .upsert({ clave, valor }, { onConflict: 'clave' })
        .select()
        .single();
    if (error) throw new Error(`Error al actualizar config: ${error.message}`);
    return data;
}

export default {
    obtenerProductos,
    obtenerUnProducto,
    agregarProducto,
    modificarProducto,
    eliminarProducto,
    subirImagenStorage,
    eliminarImagenStorage,

    obtenerExtras,
    obtenerUnExtra,
    agregarExtra,
    modificarExtra,
    eliminarExtra,

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

    // Config
    obtenerConfig,
    actualizarConfig,
};