// ============================================================
// sidebar.js — HTML del sidebar compartido + inicialización
// ============================================================
import { logout } from './auth.js'

export function getSidebarHTML(activePage) {
  const nav = [
    { href: '/dashboard.html',     icon: dashIcon,      label: 'Dashboard'      },
    { href: '/empleadas.html',     icon: personIcon,    label: 'Empleadas'      },
    { href: '/reservas.html',      icon: calIcon,       label: 'Reservas'       },
    { href: '/servicios.html',     icon: starIcon,      label: 'Servicios'      },
    { href: '/categorias.html',    icon: tagIcon,       label: 'Categorías'     },
    { href: '/clientes.html',      icon: usersIcon,     label: 'Clientes'       },
    { href: '/disponibilidad.html',icon: clockIcon,     label: 'Disponibilidad' },
    { href: '/testimonios.html',   icon: msgIcon,       label: 'Testimonios'    },
    { href: '/configuracion.html', icon: gearIcon,      label: 'Configuración'  },
    { href: '/admins.html',        icon: shieldIcon,    label: 'Admins'         },
  ]

  const items = nav.map(n => `
    <a href="${n.href}" class="nav-item${n.href === activePage ? ' active' : ''}">
      ${n.icon}
      <span>${n.label}</span>
    </a>
  `).join('')

  return `
    <div class="sidebar-logo">
      <div class="sidebar-logo-text">Serenità</div>
      <div class="sidebar-logo-sub">Panel Administrativo</div>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section-label">Gestión</div>
      ${items}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user" id="sidebar-user-btn">
        <div class="sidebar-user-avatar" id="sidebar-avatar">A</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name" id="sidebar-user-name">Admin</div>
          <div class="sidebar-user-role" id="sidebar-user-role">Administradora</div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </div>
    </div>
  `
}

export async function initSidebar(adminUser) {
  const sidebarEl = document.getElementById('sidebar')
  if (!sidebarEl) return

  // Poblar nombre y avatar del admin actual
  const admin = adminUser || window.__adminUser
  if (admin) {
    const nameEl   = document.getElementById('sidebar-user-name')
    const roleEl   = document.getElementById('sidebar-user-role')
    const avatarEl = document.getElementById('sidebar-avatar')
    if (nameEl)   nameEl.textContent   = admin.nombre || admin.email || 'Admin'
    if (roleEl)   roleEl.textContent   = admin.email  || 'Administradora'
    if (avatarEl) avatarEl.textContent = (admin.nombre || admin.email || 'A')[0].toUpperCase()
  }

  const el = document.getElementById('sidebar-user-btn')
  if (el) {
    el.addEventListener('click', async () => {
      if (confirm('¿Cerrar sesión del panel administrativo?')) {
        await logout()
      }
    })
  }
}

// ——— SVG íconos ————————————————————————————————————————————
const dashIcon   = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
const personIcon = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
const calIcon    = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
const starIcon   = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
const usersIcon  = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
const clockIcon  = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
const msgIcon    = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
const gearIcon   = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
const shieldIcon = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
const tagIcon    = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`
