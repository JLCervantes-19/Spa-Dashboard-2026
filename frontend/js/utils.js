// ============================================================
// utils.js — Utilidades compartidas del admin
// ============================================================

export const ESTADOS_CITA = {
  pendiente:   { label: 'Pendiente',   badge: 'badge-pendiente'  },
  confirmada:  { label: 'Confirmada',  badge: 'badge-confirmada' },
  realizada:   { label: 'Realizada',   badge: 'badge-realizada'  },
  atrasada:    { label: 'Atrasada',    badge: 'badge-atrasada'   },
  no_asistio:  { label: 'No asistió',  badge: 'badge-no_asistio' },
  cancelada:   { label: 'Cancelada',   badge: 'badge-cancelada'  },
}

export const ESTADOS_TESTIMONIO = {
  pendiente: { label: 'Pendiente', badge: 'badge-yellow' },
  aprobado:  { label: 'Aprobado',  badge: 'badge-green'  },
  oculto:    { label: 'Oculto',    badge: 'badge-gray'   },
}

export const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// ——— Fechas ————————————————————————————————————————————————
export function formatFecha(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
export function formatFechaCorta(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}
export function formatFechaLarga(fecha) {
  if (!fecha) return '—'
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
export function formatHora(hora) {
  if (!hora) return '—'
  const [h, m] = hora.split(':')
  const hNum = parseInt(h)
  return `${hNum % 12 || 12}:${m} ${hNum >= 12 ? 'PM' : 'AM'}`
}
export function formatDateTime(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
export function todayISO() {
  return new Date().toISOString().split('T')[0]
}
export function startOfWeekISO() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split('T')[0]
}
export function startOfMonthISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-01`
}

// ——— Moneda ————————————————————————————————————————————————
export function formatPrecio(n) {
  if (n == null) return '—'
  return `$${Number(n).toLocaleString('es-CO')}`
}

// ——— Texto ————————————————————————————————————————————————
export function sanitizeText(str) {
  if (!str) return ''
  return String(str).replace(/[<>&"']/g, c => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]
  )).slice(0, 2000)
}
export function truncate(str, max = 60) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

// ——— Iniciales y avatar ————————————————————————————————————
export function iniciales(nombre, apellido) {
  const n = (nombre || '').charAt(0).toUpperCase()
  const a = (apellido || '').charAt(0).toUpperCase()
  return (n + a) || '??'
}

const AVATAR_COLORS = [
  ['#F3E8FF','#7C3AED'], ['#DBEAFE','#1D4ED8'], ['#D1FAE5','#065F46'],
  ['#FEF9C3','#92400E'], ['#FFE4E6','#BE123C'], ['#E0F2FE','#0369A1'],
  ['#FEF3C7','#B45309'], ['#FCE7F3','#9D174D'],
]
export function avatarColor(nombre) {
  const idx = (nombre || '').charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx] || AVATAR_COLORS[0]
}
export function avatarHTML(nombre, apellido, fotoUrl, size = 36) {
  const ini = iniciales(nombre, apellido)
  const [bg, color] = avatarColor(nombre)
  if (fotoUrl) {
    return `<img src="${fotoUrl}" class="avatar" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover" alt="${ini}" onerror="this.outerHTML='${_avatarIni(ini, bg, color, size)}'" />`
  }
  return _avatarIni(ini, bg, color, size)
}
function _avatarIni(ini, bg, color, size) {
  return `<div class="avatar" style="width:${size}px;height:${size}px;background:${bg};color:${color};font-family:'Cormorant Garamond',serif;font-size:${size * 0.35}px;font-weight:300;">${ini}</div>`
}

// ——— Badge de estado ————————————————————————————————————————
export function badgeCita(estado) {
  const e = ESTADOS_CITA[estado] || { label: estado, badge: 'badge-gray' }
  return `<span class="badge ${e.badge}">${e.label}</span>`
}
export function badgeTestimonio(estado) {
  const e = ESTADOS_TESTIMONIO[estado] || { label: estado, badge: 'badge-gray' }
  return `<span class="badge ${e.badge}">${e.label}</span>`
}
export function badgeActivo(activo) {
  return activo
    ? `<span class="badge badge-green"><span class="badge-dot"></span>Activa</span>`
    : `<span class="badge badge-gray"><span class="badge-dot"></span>Inactiva</span>`
}

// ——— Toast global ————————————————————————————————————————————
export function toast(msg, type = 'default') {
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    document.body.appendChild(container)
  }
  const icons = {
    success: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    default: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  }
  const el = document.createElement('div')
  el.className = `toast ${type}`
  el.innerHTML = `<span class="toast-icon">${icons[type] || icons.default}</span><span>${msg}</span>`
  container.appendChild(el)
  requestAnimationFrame(() => el.classList.add('show'))
  setTimeout(() => {
    el.classList.remove('show')
    setTimeout(() => el.remove(), 300)
  }, 3500)
}

// ——— Modal helper ————————————————————————————————————————————
export function openModal(id)  { document.getElementById(id)?.classList.add('open') }
export function closeModal(id) { document.getElementById(id)?.classList.remove('open') }

export function confirmAction({ title, text, btnLabel = 'Eliminar', onConfirm }) {
  let overlay = document.getElementById('confirm-overlay')
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.id = 'confirm-overlay'
    overlay.className = 'modal-overlay'
    overlay.innerHTML = `
      <div class="modal modal-sm confirm-modal">
        <div class="modal-body">
          <div class="confirm-icon danger">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <p class="confirm-title" id="confirm-title"></p>
          <p class="confirm-text" id="confirm-text"></p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="confirm-cancel">Cancelar</button>
          <button class="btn btn-danger" id="confirm-ok"></button>
        </div>
      </div>
    `
    document.body.appendChild(overlay)
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open') })
    document.getElementById('confirm-cancel').addEventListener('click', () => overlay.classList.remove('open'))
  }
  document.getElementById('confirm-title').textContent = title
  document.getElementById('confirm-text').textContent  = text || ''
  document.getElementById('confirm-ok').textContent    = btnLabel

  // Clonar para evitar listeners duplicados
  const btn = document.getElementById('confirm-ok')
  const fresh = btn.cloneNode(true)
  btn.parentNode.replaceChild(fresh, btn)
  fresh.addEventListener('click', async () => {
    overlay.classList.remove('open')
    await onConfirm()
  })
  overlay.classList.add('open')
}

// ——— Sidebar helper: marcar ítem activo ———————————————————
export function setActiveNav(href) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('href') === href)
  })
}

// ——— Render sidebar user info ——————————————————————————————
export function renderSidebarUser(admin) {
  const el = document.getElementById('sidebar-user-name')
  const elRole = document.getElementById('sidebar-user-role')
  const elAvatar = document.getElementById('sidebar-avatar')
  if (el) el.textContent = admin?.nombre || 'Administradora'
  if (elRole) elRole.textContent = 'Admin'
  if (elAvatar) {
    const ini = (admin?.nombre || 'A').charAt(0).toUpperCase()
    elAvatar.textContent = ini
  }
}

// ——— Debounce ————————————————————————————————————————————————
export function debounce(fn, ms = 300) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

// ——— Auto-asignación de empleada ——————————————————————————
export async function autoAsignarEmpleada(supabase, servicioId, fecha) {
  const { data: asignaciones } = await supabase
    .from('empleado_servicios')
    .select('empleado_id')
    .eq('servicio_id', servicioId)

  if (!asignaciones?.length) return null

  const empleadaIds = asignaciones.map(a => a.empleado_id)

  const { data: citasDia } = await supabase
    .from('citas')
    .select('empleado_id')
    .eq('fecha', fecha)
    .neq('estado', 'cancelada')
    .in('empleado_id', empleadaIds)

  const conteo = {}
  empleadaIds.forEach(id => { conteo[id] = 0 })
  ;(citasDia || []).forEach(c => {
    if (c.empleado_id) conteo[c.empleado_id] = (conteo[c.empleado_id] || 0) + 1
  })

  return empleadaIds.reduce((min, id) => conteo[id] < conteo[min] ? id : min, empleadaIds[0])
}
