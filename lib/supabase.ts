import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dgvplkbaxgbmqhshebwp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRndnBsa2JheGdibXFoc2hlYndwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDI0NzAsImV4cCI6MjA5NDAxODQ3MH0.H7ji28EvNW2kgneTli83yNcdntF9eOLd_LmOBS8AvM4";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);