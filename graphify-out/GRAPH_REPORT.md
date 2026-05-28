# Graph Report - /Users/macuser/Desktop/LANDING PROYECTS/Spa_OhDiosas/SISTEMA WEB/admin-dashboard  (2026-05-27)

## Corpus Check
- Corpus is ~22,323 words - fits in a single context window. You may not need a graph.

## Summary
- 122 nodes · 155 edges · 20 communities (7 shown, 13 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Utils + KPI Helpers|Utils + KPI Helpers]]
- [[_COMMUNITY_Auth JS Functions|Auth JS Functions]]
- [[_COMMUNITY_Frontend JS Modules|Frontend JS Modules]]
- [[_COMMUNITY_Admin Pages|Admin Pages]]
- [[_COMMUNITY_Edge Function + is_admin()|Edge Function + is_admin()]]
- [[_COMMUNITY_Express Server|Express Server]]
- [[_COMMUNITY_Avatar Utilities|Avatar Utilities]]
- [[_COMMUNITY_Testimonios|Testimonios]]
- [[_COMMUNITY_DB Tables|DB Tables]]
- [[_COMMUNITY_RLS Policies|RLS Policies]]
- [[_COMMUNITY_Configuracion Page|Configuracion Page]]
- [[_COMMUNITY_Empleadas CRUD|Empleadas CRUD]]
- [[_COMMUNITY_Supabase Project|Supabase Project]]
- [[_COMMUNITY_Vercel Deploy|Vercel Deploy]]
- [[_COMMUNITY_n8n Workflow|n8n Workflow]]
- [[_COMMUNITY_Security Headers|Security Headers]]
- [[_COMMUNITY_Rate Limiting|Rate Limiting]]
- [[_COMMUNITY_Migration 2 SQL|Migration 2 SQL]]
- [[_COMMUNITY_Dashboard KPIs|Dashboard KPIs]]
- [[_COMMUNITY_Supabase Storage|Supabase Storage]]

## God Nodes (most connected - your core abstractions)
1. `Auth Module (frontend/js/auth.js)` - 9 edges
2. `Empleadas CRUD Page (frontend/empleadas.html)` - 9 edges
3. `Function: requireAdmin()` - 7 edges
4. `Supabase Client Instance` - 7 edges
5. `Dashboard Page (frontend/dashboard.html)` - 7 edges
6. `Supabase Edge Function: smooth-function` - 7 edges
7. `Sidebar Component (frontend/js/sidebar.js)` - 6 edges
8. `Supabase Frontend Client (frontend/js/supabase-client.js)` - 6 edges
9. `Admins Management Page (frontend/admins.html)` - 6 edges
10. `Testimonios Management Page (frontend/testimonios.html)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Auth Module (frontend/js/auth.js)` --implements--> `Rate Limiting: 10 login attempts / 15 min per browser`  [INFERRED]
  frontend/js/auth.js → README.md
- `Testimonios Management Page (frontend/testimonios.html)` --references--> `DB Table: testimonios`  [EXTRACTED]
  frontend/testimonios.html → database/migration_2.sql
- `Configuracion Page (frontend/configuracion.html)` --references--> `DB Table: configuracion`  [EXTRACTED]
  frontend/configuracion.html → database/migration_2.sql
- `Rate Limiting (10 attempts / 15 min sessionStorage)` --semantically_similar_to--> `RLS Policies (admin full access)`  [INFERRED] [semantically similar]
  frontend/js/auth.js → database/schema_admin.sql
- `Admins Management Page (frontend/admins.html)` --references--> `DB Table: admin_users`  [EXTRACTED]
  frontend/admins.html → database/migration_2.sql

## Hyperedges (group relationships)
- **Admin Authentication Guard Pattern** — auth_requireadmin, schema_admin_admin_users, schema_admin_is_admin, schema_admin_rls_policy [INFERRED 0.95]
- **Empleada-Servicio Assignment Flow** — schema_admin_empleado_servicios, utils_autoasignarempleada, empleadas_html_empleadas_page [EXTRACTED 0.95]
- **All Frontend Pages Share Auth + Supabase Client + Sidebar + Utils** — dashboard_html, empleadas_html, admins_html, testimonios_html, configuracion_html, auth_js, supabase_client_js, sidebar_js, utils_js [EXTRACTED 1.00]
- **Admin Auth Double Validation: Supabase Auth + is_admin() RLS** — auth_js, fn_is_admin, table_admin_users, supabase_project [EXTRACTED 1.00]
- **Employee Creation Flow: Edge Fn → Auth → empleados → empleado_servicios** — empleadas_html, edge_function_smooth, table_empleados, table_empleado_servicios, supabase_project [EXTRACTED 1.00]
- **Admin Creation Flow: Edge Fn → Auth → admin_users** — admins_html, edge_function_smooth, table_admin_users, supabase_project [EXTRACTED 1.00]
- **Migration 2: configuracion table + testimonios normalization + RLS policies** — migration_2_sql, table_configuracion, table_testimonios, rls_policy_admin_full, rls_policy_lectura_publica, rls_policy_testimonios_public, fn_is_admin [EXTRACTED 1.00]
- **Dashboard KPIs + Chart.js Visualizations from citas/empleados** — dashboard_html, chartjs_lib, table_citas, table_empleados, table_servicios, table_clientes [EXTRACTED 1.00]

## Communities (20 total, 13 thin omitted)

### Community 0 - "Utils + KPI Helpers"
Cohesion: 0.07
Nodes (4): AVATAR_COLORS, DIAS_SEMANA, ESTADOS_CITA, ESTADOS_TESTIMONIO

### Community 1 - "Auth JS Functions"
Cohesion: 0.12
Nodes (20): Function: cambiarPassword(newPassword), Function: getSession(), Function: login(email, password), Rate Limiting (10 attempts / 15 min sessionStorage), Function: redirectIfAdmin(), Function: requireAdmin(), Page: Clientes (clientes.html), Page: Disponibilidad (disponibilidad.html) (+12 more)

### Community 2 - "Frontend JS Modules"
Cohesion: 0.21
Nodes (10): clearAttempts(), getAttempts(), getSession(), isRateLimited(), login(), logout(), recordAttempt(), redirectIfAdmin() (+2 more)

### Community 3 - "Admin Pages"
Cohesion: 0.3
Nodes (15): Admins Management Page (frontend/admins.html), Auth Module (frontend/js/auth.js), Chart.js v4 (CDN), Configuracion Page (frontend/configuracion.html), Dashboard Page (frontend/dashboard.html), Empleadas CRUD Page (frontend/empleadas.html), Sidebar Component (frontend/js/sidebar.js), Supabase Frontend Client (frontend/js/supabase-client.js) (+7 more)

### Community 4 - "Edge Function + is_admin()"
Cohesion: 0.22
Nodes (13): Supabase Edge Function: smooth-function, DB Function: is_admin() SECURITY DEFINER, Instructions: Add Admin Manually, DB Migration 2 (database/migration_2.sql), Rate Limiting: 10 login attempts / 15 min per browser, README — Admin Dashboard, RLS Policy: admin_full_config (ALL via is_admin()), RLS Policy: lectura_publica_config (SELECT public) (+5 more)

### Community 5 - "Express Server"
Cohesion: 0.2
Nodes (7): app, __dirname, __filename, CLAUDE.md — Project Config, n8n Workflow: Bot SPA Web (58vtbwK4zbdspKMQ), Supabase Project: BD_Spa's_Startup (whouejjrpjcvoueyajbu), Vercel Project: spa-dashboard

### Community 6 - "Avatar Utilities"
Cohesion: 0.5
Nodes (4): avatarColor(), avatarHTML(), _avatarIni(), iniciales()

## Knowledge Gaps
- **35 isolated node(s):** `__filename`, `__dirname`, `app`, `ESTADOS_CITA`, `ESTADOS_TESTIMONIO` (+30 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Supabase Project: BD_Spa's_Startup (whouejjrpjcvoueyajbu)` connect `Express Server` to `Edge Function + is_admin()`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `Supabase Edge Function: smooth-function` connect `Edge Function + is_admin()` to `Admin Pages`, `Express Server`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `Empleadas CRUD Page (frontend/empleadas.html)` connect `Admin Pages` to `Edge Function + is_admin()`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Auth Module (frontend/js/auth.js)` (e.g. with `DB Table: admin_users` and `Supabase Frontend Client (frontend/js/supabase-client.js)`) actually correct?**
  _`Auth Module (frontend/js/auth.js)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `Function: requireAdmin()` (e.g. with `Page: Reservas (reservas.html)` and `Page: Servicios (servicios.html)`) actually correct?**
  _`Function: requireAdmin()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `__filename`, `__dirname`, `app` to the rest of the system?**
  _35 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Utils + KPI Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._