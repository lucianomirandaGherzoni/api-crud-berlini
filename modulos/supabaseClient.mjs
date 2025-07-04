// modulos/supabaseAdminClient.mjs
import { createClient } from '@supabase/supabase-js';

// Estas variables deben ser configuradas en el entorno de Vercel de tu API.
// NUNCA las expongas en el frontend.
const supabaseUrl = process.env.SUPABASE_URL || 'https://wxtjlgpzjntrditlgqtz.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dGpsZ3B6am50cmRpdGxncXR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk1NTkxMSwiZXhwIjoyMDY1NTMxOTExfQ.-SVZtdImq0CqoMreGVmcZEmXbsHUKqEElGousVQix2c';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('ERROR: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configuradas en el entorno del servidor.');
  // En un entorno de producción real, podrías querer lanzar un error o salir del proceso.
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // Importante para clientes de servidor
  },
});
