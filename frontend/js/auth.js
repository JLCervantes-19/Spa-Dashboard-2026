// ============================================================
// auth.js — Autenticación y guards del admin
// ============================================================
import { supabase } from './supabase-client.js'

const LOGIN_MAX = 10
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const RL_KEY = 'admin_login_attempts'

function getAttempts() {
  try {
    const raw = sessionStorage.getItem(RL_KEY)
    if (!raw) return { count: 0, first: Date.now() }
    return JSON.parse(raw)
  } catch { return { count: 0, first: Date.now() } }
}
function recordAttempt() {
  const d = getAttempts()
  const now = Date.now()
  if (now - d.first > LOGIN_WINDOW_MS) {
    sessionStorage.setItem(RL_KEY, JSON.stringify({ count: 1, first: now }))
    return 1
  }
  const count = d.count + 1
  sessionStorage.setItem(RL_KEY, JSON.stringify({ count, first: d.first }))
  return count
}
function clearAttempts() { sessionStorage.removeItem(RL_KEY) }
function isRateLimited() {
  const d = getAttempts()
  if (Date.now() - d.first > LOGIN_WINDOW_MS) return false
  return d.count >= LOGIN_MAX
}

// ——— Login ————————————————————————————————————————————————
export async function login(email, password) {
  if (isRateLimited()) {
    throw new Error('Demasiados intentos. Espera 15 minutos antes de intentar de nuevo.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    recordAttempt()
    throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.')
  }
  clearAttempts()

  // Verificar que es admin
  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('id, nombre, email')
    .eq('user_id', data.user.id)
    .single()

  if (adminError || !adminRecord) {
    await supabase.auth.signOut()
    throw new Error('Acceso no autorizado. Esta cuenta no tiene permisos de administrador.')
  }

  return { user: data.user, admin: adminRecord }
}

// ——— Logout ——————————————————————————————————————————————
export async function logout() {
  clearAttempts()
  sessionStorage.clear()
  localStorage.removeItem('admin_user')
  await supabase.auth.signOut()
  window.location.href = '/index.html'
}

// ——— Obtener sesión ————————————————————————————————————————
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ——— Guard: redirige al login si no hay sesión ni rol admin —
export async function requireAdmin() {
  const session = await getSession()
  if (!session) {
    window.location.href = '/index.html'
    return null
  }

  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('id, nombre, email')
    .eq('user_id', session.user.id)
    .single()

  if (!adminRecord) {
    await supabase.auth.signOut()
    window.location.href = '/index.html'
    return null
  }

  // Cachear en memoria para evitar repetir la consulta en la misma sesión
  window.__adminUser = adminRecord
  return { session, admin: adminRecord }
}

// ——— Redirigir al dashboard si ya hay sesión ——————————————
export async function redirectIfAdmin() {
  const session = await getSession()
  if (!session) return

  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (adminRecord) window.location.href = '/dashboard.html'
}

// ——— Cambiar contraseña ————————————————————————————————————
export async function cambiarPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error('No se pudo actualizar la contraseña.')
}
