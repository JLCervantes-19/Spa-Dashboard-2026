// ============================================================
// auth.js — Autenticación y guards del admin
// ============================================================
import { supabase } from './supabase-client.js'

// Rate-limiting login: máx 10 intentos en 15 min
const LOGIN_MAX       = 10
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const RL_KEY          = 'admin_login_attempts'

// Límites de sesión (más estrictos por ser panel administrativo)
const SESSION_MAX_MS  = 4 * 60 * 60 * 1000   // 4 horas absolutas
const IDLE_MAX_MS     = 20 * 60 * 1000        // 20 min sin actividad
const WARN_BEFORE_MS  = 2 * 60 * 1000         // advertir 2 min antes del cierre
const KEY_START       = 'admin_session_start'
const KEY_ACTIVE      = 'admin_last_active'

// ——— Rate limiting ————————————————————————————————————————
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

// ——— Verificación de expiración ——————————————————————————
function isSessionExpired() {
  const start  = parseInt(localStorage.getItem(KEY_START)  || '0')
  const active = parseInt(localStorage.getItem(KEY_ACTIVE) || '0')
  if (!start) return true
  const now = Date.now()
  if (now - start  > SESSION_MAX_MS) return true
  if (now - active > IDLE_MAX_MS)    return true
  return false
}

// ——— Modal de advertencia de inactividad ——————————————————
let _warningActive   = false
let _warningInterval = null

function showInactivityWarning(secondsLeft, onContinue, onLogout) {
  if (_warningActive) return
  _warningActive = true

  const overlay = document.createElement('div')
  overlay.id = 'session-warning-overlay'
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:99999',
    'background:rgba(0,0,0,0.55)', 'backdrop-filter:blur(6px)',
    'display:flex', 'align-items:center', 'justify-content:center',
    'font-family:system-ui,sans-serif',
  ].join(';')

  overlay.innerHTML = `
    <div style="
      background:#fff; border-radius:20px; padding:36px 32px;
      max-width:380px; width:90%; text-align:center;
      box-shadow:0 24px 64px rgba(0,0,0,0.3);
      animation: fadeInUp .25s ease;
    ">
      <style>
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform:scale(1);   opacity:.8; }
          50%  { transform:scale(1.1); opacity:.4; }
          100% { transform:scale(1);   opacity:.8; }
        }
      </style>
      <div style="
        width:64px; height:64px; border-radius:50%;
        background:linear-gradient(135deg,#fce4ec,#f8bbd0);
        display:flex; align-items:center; justify-content:center;
        margin:0 auto 16px; font-size:28px;
        animation:pulse-ring 2s ease infinite;
      ">⏳</div>
      <h3 style="margin:0 0 8px;font-size:1.25rem;color:#1a1a2e;font-weight:700;">
        ¿Sigues ahí?
      </h3>
      <p style="margin:0 0 6px;color:#666;font-size:.9rem;line-height:1.6;">
        Tu sesión se cerrará automáticamente en
      </p>
      <div style="margin:0 0 24px;">
        <span id="session-countdown" style="
          font-size:2.8rem; font-weight:800; line-height:1;
          color:#d4509a;
        ">${secondsLeft}</span>
        <span style="font-size:.85rem;color:#999;display:block;margin-top:2px;">segundos</span>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;">
        <button id="btn-session-logout" style="
          padding:11px 20px; border:2px solid #e0e0e0; background:#fff;
          border-radius:10px; cursor:pointer; font-size:.9rem; color:#888;
          font-weight:500; transition:all .2s;
        " onmouseover="this.style.borderColor='#ccc';this.style.color='#555'"
           onmouseout="this.style.borderColor='#e0e0e0';this.style.color='#888'">
          Cerrar sesión
        </button>
        <button id="btn-session-continue" style="
          padding:11px 28px; border:none;
          background:linear-gradient(135deg,#d4509a,#a83279);
          border-radius:10px; cursor:pointer; font-size:.9rem;
          color:#fff; font-weight:700; box-shadow:0 4px 14px rgba(212,80,154,.35);
          transition:opacity .2s;
        " onmouseover="this.style.opacity='.85'"
           onmouseout="this.style.opacity='1'">
          Sigo aquí
        </button>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  let remaining = secondsLeft
  _warningInterval = setInterval(() => {
    remaining--
    const el = document.getElementById('session-countdown')
    if (el) {
      el.textContent = remaining
      // Pone rojo cuando quedan menos de 30 segundos
      if (remaining <= 30) el.style.color = '#e53935'
    }
    if (remaining <= 0) {
      _clearWarning()
      onLogout()
    }
  }, 1000)

  document.getElementById('btn-session-continue').addEventListener('click', () => {
    _clearWarning()
    onContinue()
  })

  document.getElementById('btn-session-logout').addEventListener('click', () => {
    _clearWarning()
    onLogout()
  })
}

function _clearWarning() {
  if (_warningInterval) { clearInterval(_warningInterval); _warningInterval = null }
  const overlay = document.getElementById('session-warning-overlay')
  if (overlay) overlay.remove()
  _warningActive = false
}

function dismissWarningIfActive() {
  if (_warningActive) _clearWarning()
}

// ——— Guard de sesión activo ————————————————————————————————
let _guardStarted = false

function startSessionGuard() {
  if (_guardStarted) return
  _guardStarted = true

  // Actualizar actividad en cada interacción (throttle: 1 vez/min)
  let lastWrite = Date.now()
  const updateActivity = () => {
    const now = Date.now()
    if (now - lastWrite > 60_000) {
      localStorage.setItem(KEY_ACTIVE, now.toString())
      lastWrite = now
      dismissWarningIfActive()
    }
  }
  ;['mousemove', 'click', 'keydown', 'touchstart', 'scroll'].forEach(evt =>
    document.addEventListener(evt, updateActivity, { passive: true })
  )

  // Verificar cada 30 segundos
  setInterval(() => {
    const start  = parseInt(localStorage.getItem(KEY_START)  || '0')
    const active = parseInt(localStorage.getItem(KEY_ACTIVE) || '0')
    const now    = Date.now()

    // Sesión absoluta expirada
    if (!start || now - start > SESSION_MAX_MS) {
      dismissWarningIfActive()
      logout()
      return
    }

    const idleMs   = now - active
    const timeLeft = IDLE_MAX_MS - idleMs

    if (timeLeft <= 0) {
      dismissWarningIfActive()
      logout()
    } else if (timeLeft <= WARN_BEFORE_MS && !_warningActive) {
      showInactivityWarning(
        Math.max(1, Math.floor(timeLeft / 1000)),
        () => localStorage.setItem(KEY_ACTIVE, Date.now().toString()),
        () => logout()
      )
    } else if (timeLeft > WARN_BEFORE_MS && _warningActive) {
      dismissWarningIfActive()
    }
  }, 30_000)
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

  const { data: adminRecord, error: adminError } = await supabase
    .from('admin_users')
    .select('id, nombre, email')
    .eq('user_id', data.user.id)
    .single()

  if (adminError || !adminRecord) {
    await supabase.auth.signOut()
    throw new Error('Acceso no autorizado. Esta cuenta no tiene permisos de administrador.')
  }

  const now = Date.now().toString()
  localStorage.setItem(KEY_START, now)
  localStorage.setItem(KEY_ACTIVE, now)

  return { user: data.user, admin: adminRecord }
}

// ——— Logout ——————————————————————————————————————————————
export async function logout() {
  clearAttempts()
  sessionStorage.clear()
  localStorage.removeItem('admin_user')
  localStorage.removeItem(KEY_START)
  localStorage.removeItem(KEY_ACTIVE)
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

  if (isSessionExpired()) {
    await logout()
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

  localStorage.setItem(KEY_ACTIVE, Date.now().toString())
  startSessionGuard()

  window.__adminUser = adminRecord
  return { session, admin: adminRecord }
}

// ——— Redirigir al dashboard si ya hay sesión activa ———————
export async function redirectIfAdmin() {
  const session = await getSession()
  if (!session) return

  if (isSessionExpired()) {
    await logout()
    return
  }

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
