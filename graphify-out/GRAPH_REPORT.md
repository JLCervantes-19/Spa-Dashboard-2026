# Graph Report - .  (2026-07-17)

## Corpus Check
- 16 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 184 nodes · 297 edges · 21 communities (8 shown, 13 thin omitted)
- Extraction: 90% EXTRACTED · 9% INFERRED · 1% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.85)
- Token cost: 132,212 input · 44,070 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Configuración, Categorías y Bugs Corregidos|Configuración, Categorías y Bugs Corregidos]]
- [[_COMMUNITY_Utilidades Compartidas y Balanceo de Empleadas|Utilidades Compartidas y Balanceo de Empleadas]]
- [[_COMMUNITY_Páginas Principales del Admin|Páginas Principales del Admin]]
- [[_COMMUNITY_Módulos JS Compartidos (AuthSidebarSupabase)|Módulos JS Compartidos (Auth/Sidebar/Supabase)]]
- [[_COMMUNITY_Autenticación y Rate Limiting|Autenticación y Rate Limiting]]
- [[_COMMUNITY_Servidor Express y Cliente Supabase|Servidor Express y Cliente Supabase]]
- [[_COMMUNITY_Configuración del Proyecto y Seguridad RLS|Configuración del Proyecto y Seguridad RLS]]
- [[_COMMUNITY_Migración del Modelo de Estados de Citas|Migración del Modelo de Estados de Citas]]
- [[_COMMUNITY_Badge y Constante de Estado de Cita|Badge y Constante de Estado de Cita]]
- [[_COMMUNITY_Badge y Constante de Estado de Testimonio|Badge y Constante de Estado de Testimonio]]
- [[_COMMUNITY_Formateo de Fecha|Formateo de Fecha]]
- [[_COMMUNITY_Formateo de Hora|Formateo de Hora]]
- [[_COMMUNITY_Formateo de Precio|Formateo de Precio]]
- [[_COMMUNITY_Avatar de Usuario|Avatar de Usuario]]
- [[_COMMUNITY_Notificaciones Toast|Notificaciones Toast]]
- [[_COMMUNITY_Apertura de Modal|Apertura de Modal]]
- [[_COMMUNITY_Cierre de Modal|Cierre de Modal]]
- [[_COMMUNITY_Confirmación de Acción|Confirmación de Acción]]
- [[_COMMUNITY_Render de Usuario en Sidebar|Render de Usuario en Sidebar]]
- [[_COMMUNITY_Debounce|Debounce]]
- [[_COMMUNITY_Tabla Clientes|Tabla Clientes]]

## God Nodes (most connected - your core abstractions)
1. `servicios.html — Página CRUD de servicios` - 13 edges
2. `reservas.html — Página de gestión de reservas/citas` - 12 edges
3. `empleadas.html — Página CRUD de empleadas` - 10 edges
4. `Auth Module (frontend/js/auth.js)` - 9 edges
5. `Empleadas CRUD Page (frontend/empleadas.html)` - 9 edges
6. `hoyBogota()` - 9 edges
7. `configuracion.html — Página de configuración del spa` - 9 edges
8. `dashboard.html — Página de KPIs y gráficas (Chart.js)` - 9 edges
9. `rangoPeriodo()` - 8 edges
10. `LOGICA-DEL-SISTEMA.md — Lógica del Sistema (Sprint estructural v1, generado 2026-05-29)` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Auth Module (frontend/js/auth.js)` --implements--> `Rate Limiting: 10 login attempts / 15 min per browser`  [INFERRED]
  frontend/js/auth.js → README.md
- `RLS Policies (admin full access)` --semantically_similar_to--> `Rate Limiting (10 attempts / 15 min sessionStorage)`  [INFERRED] [semantically similar]
  database/schema_admin.sql → frontend/js/auth.js
- `Testimonios Management Page (frontend/testimonios.html)` --references--> `DB Table: testimonios`  [EXTRACTED]
  frontend/testimonios.html → database/migration_2.sql
- `Configuracion Page (frontend/configuracion.html)` --references--> `DB Table: configuracion`  [EXTRACTED]
  frontend/configuracion.html → database/migration_2.sql
- `Supabase Edge Function: smooth-function` --references--> `DB Table: admin_users`  [INFERRED]
  README.md → database/migration_2.sql

## Hyperedges (group relationships)
- **Migración del modelo de estados de citas: de 8 estados (documentado en ESTADOS-RESERVAS.md y LOGICA-DEL-SISTEMA.md) a 6 estados estandarizados (implementado en el código actual)** — estados_reservas_modelo_8_estados, logica_sistema_modelo_8_estados, citas_modelo_6_estados [INFERRED 0.95]
- **Configuración compartida de reservas y disponibilidad vía la tabla configuracion (parámetros de reserva + horario semanal)** — configuracion_parametros_reserva, disponibilidad_horario_semanal, tabla_configuracion [INFERRED 0.85]
- **Asignación automática de empleadas a citas: balanceo de carga por servicio con desempate aleatorio, usado al crear reservas y visible en la gestión de servicios/empleadas** — empleadas_balanceo_carga_por_servicio, reservas_pagina, servicios_pagina [INFERRED 0.75]

## Communities (21 total, 13 thin omitted)

### Community 0 - "Configuración, Categorías y Bugs Corregidos"
Cohesion: 0.12
Nodes (40): BUG-07: ESTADOS_TESTIMONIO usaba 'aprobado' en el JS pero la BD ya tenía constraint 'publicado' — renombrado en utils.js y testimonios.html, BUG-08: parseInt sin radix en múltiples archivos podía interpretar strings como octal — se agregó ', 10' en todos los usos de parseInt, BUG-09: addCharCounter en configuracion.html se llamaba 3 veces al cargar, agregando listeners duplicados — se guarda referencia en el._charCounter y se hace removeEventListener antes de agregar, BUG-10: el botón 'Guardar' en servicios.html no se deshabilitaba inmediatamente, permitiendo doble-submit — se agregó btn.disabled=true como primera línea del handler, categorias.html — Página CRUD de categorías de servicios, categorias.html es una página NUEVA agregada al dashboard (antes no existía) para gestionar categorías de servicios, que ahora se muestran primero en el flujo de reservas del cliente, configuracion.html — Página de configuración del spa, Sección 'Parámetros de reserva' — única sección activa de configuracion.html: anticipación mínima (horas), reservas hasta (días, tope 240=8 meses), buffer entre citas (minutos, fallback cuando el servicio no define uno propio); se eliminó el campo decorativo 'Política de cancelación' (+32 more)

### Community 1 - "Utilidades Compartidas y Balanceo de Empleadas"
Cohesion: 0.08
Nodes (20): autoAsignarEmpleada(), AVATAR_COLORS, avatarColor(), avatarHTML(), _avatarIni(), DIAS_SEMANA, endOfMonthISO(), endOfWeekISO() (+12 more)

### Community 2 - "Páginas Principales del Admin"
Cohesion: 0.14
Nodes (29): Admins Management Page (frontend/admins.html), Auth Module (frontend/js/auth.js), Chart.js v4 (CDN), Configuracion Page (frontend/configuracion.html), Dashboard Page (frontend/dashboard.html), Supabase Edge Function: smooth-function, Empleadas CRUD Page (frontend/empleadas.html), DB Function: is_admin() SECURITY DEFINER (+21 more)

### Community 3 - "Módulos JS Compartidos (Auth/Sidebar/Supabase)"
Cohesion: 0.17
Nodes (14): clearAttempts(), _clearWarning(), dismissWarningIfActive(), getAttempts(), getSession(), isRateLimited(), isSessionExpired(), login() (+6 more)

### Community 4 - "Autenticación y Rate Limiting"
Cohesion: 0.12
Nodes (20): Function: cambiarPassword(newPassword), Function: getSession(), Function: login(email, password), Rate Limiting (10 attempts / 15 min sessionStorage), Function: redirectIfAdmin(), Function: requireAdmin(), Page: Clientes (clientes.html), Page: Disponibilidad (disponibilidad.html) (+12 more)

### Community 5 - "Servidor Express y Cliente Supabase"
Cohesion: 0.2
Nodes (6): app, __dirname, __filename, CLAUDE.md — Project Config, n8n Workflow: Bot SPA Web (58vtbwK4zbdspKMQ), Vercel Project: spa-dashboard

### Community 6 - "Configuración del Proyecto y Seguridad RLS"
Cohesion: 0.4
Nodes (5): CLAUDE.md — Configuración de Proyecto admin-dashboard (Supabase, Vercel, Render, n8n), El CLAUDE.md de admin-dashboard referencia el workflow n8n 'Bot SPA Web' con ID 'DbBMJfV5hulsPVdR', mientras que la configuración global del proyecto referencia el ID '58vtbwK4zbdspKMQ' para el mismo workflow — posible desactualización de uno de los dos documentos, README.md — Admin Dashboard (guía de despliegue y arquitectura), graphify-out/ contiene el grafo de conocimiento del proyecto, forzado al repositorio con git add -f para sincronizarlo entre equipos, pese a estar excluido via .gitignore, RLS de Supabase endurecido: 12 tablas tenían políticas de escritura anónima abierta (USING true) con la llave pública anon; se retiró dejando solo lo mínimo necesario (bot n8n: SELECT en citas/clientes, INSERT en chat_sessions)

### Community 7 - "Migración del Modelo de Estados de Citas"
Cohesion: 0.67
Nodes (4): Modelo actual de 6 estados de citas (pendiente, confirmada, completada, no_asistio, cancelada_cliente, cancelada_admin) implementado en el código del dashboard tras migración de BD que reemplazó el CHECK constraint de 8 estados, ESTADOS-RESERVAS.md — Estados de Reservas (documento), Modelo de 8 estados de citas (pendiente, confirmada, en_proceso, realizada, atrasada, no_asistio, cancelada, reagendada) documentado en ESTADOS-RESERVAS.md — DESACTUALIZADO: la BD fue migrada a un modelo de 6 estados estandarizados, Modelo de 8 estados de citas con CHECK constraint en tabla citas, documentado en LOGICA-DEL-SISTEMA.md (Sección 1) — DESACTUALIZADO: el constraint fue reemplazado por uno nuevo con 6 estados

## Ambiguous Edges - Review These
- `README.md — Admin Dashboard (guía de despliegue y arquitectura)` → `RLS de Supabase endurecido: 12 tablas tenían políticas de escritura anónima abierta (USING true) con la llave pública anon; se retiró dejando solo lo mínimo necesario (bot n8n: SELECT en citas/clientes, INSERT en chat_sessions)`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `CLAUDE.md — Configuración de Proyecto admin-dashboard (Supabase, Vercel, Render, n8n)` → `Tabla Supabase: categorias (no listada en la tabla de CLAUDE.md, pero usada activamente por servicios.html y categorias.html)`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to
- `CLAUDE.md — Configuración de Proyecto admin-dashboard (Supabase, Vercel, Render, n8n)` → `El CLAUDE.md de admin-dashboard referencia el workflow n8n 'Bot SPA Web' con ID 'DbBMJfV5hulsPVdR', mientras que la configuración global del proyecto referencia el ID '58vtbwK4zbdspKMQ' para el mismo workflow — posible desactualización de uno de los dos documentos`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to
- `servicios.html — Página CRUD de servicios` → `Asignación automática de empleadas ahora balancea carga por SERVICIO ESPECÍFICO (conteo de citas de ese servicio en últimos 30 días, no de cualquier servicio) con desempate ALEATORIO en vez de alfabético — usada por autoAsignarEmpleada() invocada desde reservas.html y servicios.html`  [AMBIGUOUS]
  frontend/servicios.html · relation: conceptually_related_to

## Knowledge Gaps
- **44 isolated node(s):** `__filename`, `__dirname`, `app`, `ESTADOS_CITA`, `ESTADOS_TESTIMONIO` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `README.md — Admin Dashboard (guía de despliegue y arquitectura)` and `RLS de Supabase endurecido: 12 tablas tenían políticas de escritura anónima abierta (USING true) con la llave pública anon; se retiró dejando solo lo mínimo necesario (bot n8n: SELECT en citas/clientes, INSERT en chat_sessions)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `CLAUDE.md — Configuración de Proyecto admin-dashboard (Supabase, Vercel, Render, n8n)` and `Tabla Supabase: categorias (no listada en la tabla de CLAUDE.md, pero usada activamente por servicios.html y categorias.html)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `CLAUDE.md — Configuración de Proyecto admin-dashboard (Supabase, Vercel, Render, n8n)` and `El CLAUDE.md de admin-dashboard referencia el workflow n8n 'Bot SPA Web' con ID 'DbBMJfV5hulsPVdR', mientras que la configuración global del proyecto referencia el ID '58vtbwK4zbdspKMQ' para el mismo workflow — posible desactualización de uno de los dos documentos`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `servicios.html — Página CRUD de servicios` and `Asignación automática de empleadas ahora balancea carga por SERVICIO ESPECÍFICO (conteo de citas de ese servicio en últimos 30 días, no de cualquier servicio) con desempate ALEATORIO en vez de alfabético — usada por autoAsignarEmpleada() invocada desde reservas.html y servicios.html`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Supabase Project: BD_Spa's_Startup (whouejjrpjcvoueyajbu)` connect `Páginas Principales del Admin` to `Servidor Express y Cliente Supabase`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `reservas.html — Página de gestión de reservas/citas` (e.g. with `Asignación automática de empleadas ahora balancea carga por SERVICIO ESPECÍFICO (conteo de citas de ese servicio en últimos 30 días, no de cualquier servicio) con desempate ALEATORIO en vez de alfabético — usada por autoAsignarEmpleada() invocada desde reservas.html y servicios.html` and `Corrección del índice único no_overlap_citas en BD que impedía que dos empleadas distintas atendieran citas a la misma hora, bloqueando la capacidad paralela del sistema`) actually correct?**
  _`reservas.html — Página de gestión de reservas/citas` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Auth Module (frontend/js/auth.js)` (e.g. with `DB Table: admin_users` and `Supabase Frontend Client (frontend/js/supabase-client.js)`) actually correct?**
  _`Auth Module (frontend/js/auth.js)` has 3 INFERRED edges - model-reasoned connections that need verification._