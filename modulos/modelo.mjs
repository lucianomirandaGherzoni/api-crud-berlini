// modulos/data/modelo.mjs
import { supabase } from './supabaseClient.mjs'; // Importa el cliente Supabase

// Función para obtener todos los productos
async function obtenerProductos() {
    try {
        const { data: productos, error } = await supabase
            .from('productos') // 'productos' es el nombre de tu tabla en Supabase
            .select('id, nombre, marca, precio, stock') // Selecciona las columnas que necesitas
            .order('id', { ascending: true }); // Ordena por ID ascendente

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
        const { data: producto, error } = await supabase
            .from('productos') // 'productos' es el nombre de tu tabla
            .select('id, nombre, marca, precio, stock')
            .eq('id', id) // Filtra por 'id' igual al valor proporcionado
            .single(); // Espera un único resultado

        if (error) {
            if (error.code === 'PGRST116') { // Código de error si no se encuentra un registro
                return null;
            }
            throw error;
        }
        // Supabase .single() retorna null si no encuentra, o el objeto si lo encuentra.
        // No necesitamos verificar product.length === 0 como antes.
        return producto;
    } catch (error) {
        console.error(`Error al obtener producto con ID ${id}:`, error.message);
        throw error;
    }
}

// Función para agregar un producto
async function agregarProducto(nuevoProducto) {
    try {
        const { nombre, marca, precio, stock } = nuevoProducto;

        // El método .insert() recibe un objeto y devuelve el objeto insertado
        // .select() es necesario para obtener los datos insertados, incluyendo el ID generado por Supabase.
        const { data, error } = await supabase
            .from('productos') // Nombre de tu tabla en Supabase
            .insert([
                {
                    nombre: nombre,
                    marca: marca,
                    precio: precio,
                    stock: stock
                }
            ])
            .select() // Importante para obtener los datos insertados
            .single(); // Para obtener un solo registro si esperas uno

        if (error) {
            console.error("Error al agregar producto en Supabase:", error);
            throw new Error(`Error al agregar producto: ${error.message}`);
        }

        return data; // Retorna el objeto del producto insertado con su ID
    } catch (error) {
        console.error("Error en modelo.agregarProducto:", error);
        throw error;
    }
}

// Función para modificar un producto
async function modificarProducto(id, productoModificar) {
    try {
        const { nombre, marca, precio, stock } = productoModificar;

        // El método .update() recibe un objeto con los campos a actualizar
        // y .eq() se usa para especificar la condición WHERE
        const { data, error } = await supabase
            .from('productos') // Nombre de tu tabla en Supabase
            .update({
                nombre: nombre,
                marca: marca,
                precio: precio,
                stock: stock
            })
            .eq('id', id) // Condición WHERE id = :id
            .select() // Para obtener los datos actualizados si es necesario
            .single(); // Para obtener un solo registro si esperas uno

        if (error) {
            console.error(`Error al modificar producto con ID ${id} en Supabase:`, error);
            throw new Error(`Error al modificar producto: ${error.message}`);
        }
        
        // Supabase .update() devuelve los datos del registro actualizado si usas .select().
        // Si data es null, significa que no se encontró ningún registro con ese ID.
        return data !== null; // Retorna true si se modificó (data no es null), false si no se encontró.
    } catch (error) {
        console.error(`Error en modelo.modificarProducto (ID: ${id}):`, error);
        throw error;
    }
}

// Función para eliminar un producto
async function eliminarProducto(id) {
    try {
        // El método .delete() elimina registros que cumplan la condición .eq()
        const { error, count } = await supabase
            .from('productos') // Nombre de tu tabla en Supabase
            .delete()
            .eq('id', id); // Condición WHERE id = :id

        if (error) {
            console.error(`Error al eliminar producto con ID ${id} en Supabase:`, error);
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }

        // Supabase .delete() devuelve 'count' que indica el número de filas afectadas.
        // Si count > 0, significa que se eliminó al menos un registro.
        return count > 0; // Retorna true si se eliminó, false si no se encontró.
    } catch (error) {
        console.error(`Error en modelo.eliminarProducto (ID: ${id}):`, error);
        throw error;
    }
}

export default {
    obtenerProductos,
    obtenerUnProducto,
    agregarProducto, 
    modificarProducto,
    eliminarProducto,
};