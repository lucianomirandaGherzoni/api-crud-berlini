// modulos/data/supabaseClient.mjs
import { createClient } from '@supabase/supabase-js';

// ¡IMPORTANTE! Reemplaza estos valores con la URL y Anon Key de tu proyecto Supabase.
// Puedes encontrarlos en tu panel de Supabase -> Project Settings -> API.
const supabaseUrl = 'https://wxtjlgpzjntrditlgqtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dGpsZ3B6am50cmRpdGxncXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTU5MTEsImV4cCI6MjA2NTUzMTkxMX0.S-SeR-ujYG-WKMEpApavvMrcZ9EEEWRl_cgxPT4CK-Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);