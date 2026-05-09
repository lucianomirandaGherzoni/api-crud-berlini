// modulos/middleware.mjs
import { supabaseAdmin } from './supabaseClient.mjs';

/**
 * Verifica que el request incluya un JWT válido de Supabase.
 * Uso: rutasApi.post('/ruta', requireAuth, controlador.funcion)
 */
export async function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ mensaje: 'No autorizado. Se requiere sesión activa.' });
    }

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
        }
        req.user = user;
        next();
    } catch {
        return res.status(401).json({ mensaje: 'Error al verificar autenticación.' });
    }
}
