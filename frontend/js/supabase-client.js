// ============================================================
// supabase-client.js — Cliente Supabase (anon + Auth session)
// ============================================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL  = 'https://whouejjrpjcvoueyajbu.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indob3VlampycGpjdm91ZXlhamJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDMzMjYsImV4cCI6MjA5MDcxOTMyNn0.kZtL7A_wZhygZt-7erVTKpXz6YwyFoOsL-omMxbtgTo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  }
})
