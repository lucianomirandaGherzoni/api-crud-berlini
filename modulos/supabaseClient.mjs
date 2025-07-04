// modulos/supabaseAdminClient.mjs
import { createClient } from '@supabase/supabase-js';

// Estas variables deben ser configuradas en el entorno de Vercel de tu API.
// NUNCA las expongas en el frontend.
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxtjlgpzjntrditlgqtz.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '13fe1160b7820d517b1cb833e4621073f819d0877f6c35cf4362289822093b7a';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('ERROR: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configuradas en el entorno del servidor.');
  // En un entorno de producción real, podrías querer lanzar un error o salir del proceso.
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // Importante para clientes de servidor
  },
});
