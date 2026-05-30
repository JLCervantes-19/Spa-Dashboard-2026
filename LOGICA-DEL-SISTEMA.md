# Lógica del Sistema — Spa Oh Diosas
> Generado: 2026-05-29 | Ciclo: Sprint estructural v1

---

## SECCIÓN 1: ESTADOS DE RESERVAS

### Tabla completa de estados

| Estado | Código | Color | Quien lo asigna | Descripción |
|--------|--------|-------|-----------------|-------------|
| Pendiente | `pendiente` | Gris / Violeta | Sistema al crear | Reserva registrada, sin confirmar asignación |
| Confirmada | `confirmada` | Azul | Sistema tras asignación automática | Empleada asignada, reserva activa |
| En proceso | `en_proceso` | Amarillo | Empleada al iniciar el servicio | El servicio está siendo realizado ahora mismo |
| Realizada | `realizada` | Verde | Empleada al terminar | Servicio completado exitosamente |
| Atrasada | `atrasada` | Naranja | Empleada o sistema | Cliente llegó tarde o servicio no comenzó a tiempo |
| No asistió | `no_asistio` | Rojo | Empleada | Cliente no se presentó |
| Cancelada | `cancelada` | Gris oscuro | Admin o cliente | Reserva anulada permanentemente |
| Reagendada | `reagendada` | Morado | Admin | Se cambió fecha/hora; empleada ve aviso en staff-app |

### Constraint en BD (tabla `citas`)
```sql
CHECK (estado IN (
  'pendiente','confirmada','en_proceso',
  'realizada','atrasada','no_asistio',
  'cancelada','reagendada'
))
```

### Transiciones permitidas
```
pendiente   → confirmada   (automático al asignar empleada)
confirmada  → en_proceso   (empleada al iniciar)
confirmada  → atrasada     (empleada o sistema)
confirmada  → no_asistio   (empleada)
confirmada  → cancelada    (admin)
confirmada  → reagendada   (admin, cambia fecha/hora)
en_proceso  → realizada    (empleada al terminar)
en_proceso  → atrasada     (si hay demora durante servicio)
atrasada    → en_proceso   (cuando inicia con retraso)
atrasada    → no_asistio   (empleada confirma ausencia)
reagendada  → confirmada   (nuevo slot asignado automáticamente)
```

### Transiciones NO permitidas (estados terminales)
- `realizada → cualquier otro` — estado terminal
- `no_asistio → cualquier otro` — estado terminal
- `cancelada → cualquier otro` — estado terminal
- `pendiente → realizada` — no se puede saltar pasos
- `pendiente → no_asistio` — no se puede saltar pasos

### Por superficie
| Superficie | Estados que puede asignar |
|-----------|--------------------------|
| oh-diosas (cliente) | — (solo sistema crea con `confirmada`) |
| staff-app (empleada) | `en_proceso`, `realizada`, `atrasada`, `no_asistio`, `cancelada` |
| admin-dashboard | Todos los 8 estados + `reagendada` con cambio de fecha/hora |
| API / sistema | `pendiente`, `confirmada` (asignación automática) |
| n8n chatbot | Lee estados, no los modifica directamente |

---

## SECCIÓN 2: ALGORITMO DE ASIGNACIÓN AUTOMÁTICA

### Archivo: `SpaOhDiosas/routes/bookings.js`

### Flujo paso a paso

**PASO 1 — Obtener candidatas:**
```js
SELECT empleados.* FROM empleado_servicios
JOIN empleados ON empleados.id = empleado_servicios.empleado_id
WHERE empleado_servicios.servicio_id = [servicio_solicitado]
AND empleados.activo = true
```

**PASO 2 — Filtrar por disponibilidad real (sin cruces):**
Para cada candidata, verificar que NO tenga reserva que cruce el slot solicitado:
```
hora_inicio_nueva < hora_fin_existente
AND hora_fin_nueva > hora_inicio_existente
AND fecha = fecha_solicitada
AND estado NOT IN ('cancelada', 'no_asistio')
```
También verifica bloqueos (tabla `bloqueos`) con la misma lógica de cruce.

**PASO 3 — Selección por menor carga (distribución justa):**
```
Prioridad 1: menor cantidad de citas `realizada` en los últimos 30 días
Prioridad 2: menor cantidad de reservas activas hoy
Prioridad 3: orden alfabético por nombre (desempate final)
```

**PASO 4 — Resultado:**
- Si hay candidata disponible → crear cita con `estado='confirmada'` y `empleado_id` asignado
- Si NO hay candidata → retornar HTTP 409 con horarios alternativos sugeridos (próximos 3 slots disponibles en los siguientes 7 días)

### Función de horarios sugeridos (`sugerirHorarios`)
- Busca en los próximos 14 días desde la fecha solicitada
- Salta días sin horario activo (domingos, días configurados como inactivos)
- Retorna hasta 3 sugerencias con formato legible: "lunes 1 de junio a las 3:00 PM"

### Reagendamiento desde admin-dashboard
- Modal en `reservas.html` con selector de fecha y carga dinámica de slots disponibles
- Al confirmar: actualiza `fecha`, `hora_inicio` y `estado = 'reagendada'` en BD
- La empleada ve el estado `reagendada` en staff-app con aviso visual

---

## SECCIÓN 3: REGLAS DE NEGOCIO ACTIVAS

### Anticipación mínima para reservar: 2 horas
- **Regla:** Un slot es seleccionable solo si `DateTime.now(Colombia) + 2h <= DateTime(fecha + hora_slot)`
- **Implementación:** Filtro en `loadSlots()` del frontend (`bookings.js`)
- **BD:** `configuracion.reserva_anticip_min_horas = 2`
- **Antes:** Lógica hardcoded — si hora >= 18:00 mostrar desde pasado mañana, sino desde mañana

### Calendario de reservas
- Muestra 30 días desde hoy (incluido hoy)
- Días activos/inactivos se leen de `configuracion.horario_semana` (JSON)
- Días sin horario activo se renderizan deshabilitados (opacity 0.35, cursor not-allowed)
- Los slots dentro de las 2 horas de anticipación se filtran automáticamente

### Horarios configurables desde dashboard
- Sección "Parámetros de reserva" en admin-dashboard → `configuracion.horario_semana`
- Lunes-Domingo con hora de apertura/cierre y toggle activo/inactivo
- Cambio inmediato: el frontend de reservas lee la config en cada sesión

### Días laborales configurables
- Cada día de la semana puede activarse/desactivarse individualmente
- La API de slots respeta el horario activo de BD
- Si un día está inactivo en BD, el calendario lo deshabilita visualmente

### Máximo de servicios simultáneos por empleada: 1
- Una empleada solo puede atender una cita a la vez
- Verificado por la función `cruzan()` que detecta solapamiento de horarios

### Distribución de carga entre empleadas
- Criterio primario: menor cantidad de servicios realizados en los últimos 30 días
- Criterio secundario: menor cantidad de citas activas hoy
- Criterio de desempate: orden alfabético

---

## SECCIÓN 4: BUGS ENCONTRADOS Y CORREGIDOS

### BUG-01: Service Worker bloqueaba todos los cambios en desarrollo
- **Causa:** `sw.js` cacheaba `bookings.js` y `spa.css` en versión `v5`; el navegador nunca pedía archivos nuevos
- **Solución:** Bump a `v6`, headers `no-store` en servidor dev, SW desactivado en `localhost`
- **Archivos:** `frontend/sw.js`, `server.js` (los 3 proyectos), 4 HTML de SpaOhDiosas

### BUG-02: Type mismatch en comparación de servicioId (óvalo no se llenaba)
- **Causa:** `btn.dataset.id` devuelve string, `Number(uuid)` da `NaN`; `NaN === uuid` siempre es false
- **Solución:** CSS puro con clase `.is-selected` + evento `click` que alterna la clase sin re-render
- **Archivos:** `frontend/js/bookings.js`, `frontend/css/spa.css`

### BUG-03: Constraint BD obsoleto
- **Causa:** Tabla `citas` tenía dos constraints (`citas_estado_check` + `estado_check`) con estados legacy: `confirmada, cancelada, asistio, no_asistio`
- **Solución:** Drop ambos, nuevo constraint único con 8 estados estandarizados; `asistio` → migrado a `realizada`
- **BD:** Migración `estandarizar_estados_citas`

### BUG-04: Calendario ignoraba BD
- **Causa:** `getAvailableDates()` excluía domingos hardcodeado (`d.getDay() !== 0`) e ignoraba la configuración real del negocio en BD
- **Solución:** Eliminar exclusión hardcodeada; el calendario lee `horario_semana` de BD y deshabilita días inactivos
- **Archivos:** `frontend/js/bookings.js`

### BUG-05: Anticipación de 2 horas no implementada en frontend
- **Causa:** La BD ya tenía `reserva_anticip_min_horas=2` pero el frontend usaba regla de "6 PM → pasado mañana"
- **Solución:** Filtro `filteredData` en `loadSlots()` que excluye slots dentro de las próximas 2 horas (zona horaria Colombia)
- **Archivos:** `frontend/js/bookings.js`

### BUG-06: Badges CSS faltantes para estados nuevos
- **Causa:** `admin.css` no tenía estilos para `badge-en_proceso` y `badge-reagendada`
- **Solución:** Agregadas 2 reglas CSS
- **Archivos:** `frontend/css/admin.css`

### BUG-07: ESTADOS_TESTIMONIO usaba 'aprobado' (inconsistente con BD)
- **Causa:** BD ya tenía constraint `publicado` pero el JS del dashboard usaba `aprobado`
- **Solución:** Renombrado `aprobado` → `publicado` en utils.js y testimonios.html
- **Archivos:** `admin-dashboard/frontend/js/utils.js`, `admin-dashboard/frontend/testimonios.html`

### BUG-08: parseInt sin radix en múltiples archivos
- **Causa:** `parseInt(value)` sin segundo argumento puede interpretar strings como octal
- **Solución:** Agregado `, 10` en todos los usos de parseInt
- **Archivos:** `admin-dashboard/frontend/configuracion.html`, `servicios.html`, `disponibilidad.html`, `empleadas.html`, `testimonios.html`, `staff-app/frontend/citas.html`, ambos `utils.js`

### BUG-09: Event listener duplicado en addCharCounter
- **Causa:** La función se llama 3 veces al cargar; cada llamada agregaba un listener sin remover el anterior
- **Solución:** Guardar referencia en `el._charCounter` y hacer `removeEventListener` antes de agregar
- **Archivos:** `admin-dashboard/frontend/configuracion.html`

### BUG-10: Race condition en guardado de servicios
- **Causa:** El botón "Guardar" no se deshabilitaba inmediatamente, permitiendo doble-submit
- **Solución:** `btn.disabled = true` como primera línea del handler, antes de cualquier validación
- **Archivos:** `admin-dashboard/frontend/servicios.html`

---

## SECCIÓN 5: PENDIENTES PARA EL SIGUIENTE CICLO

### PEND-01: Notificaciones push a la empleada cuando se reagenda una cita
- La staff-app ve el estado `reagendada` pero no recibe notificación activa
- Requiere: integración con PWA push notifications o SMS/WhatsApp via n8n

### PEND-02: Validación de anticipación 2h también en el servidor
- Actualmente solo se filtra en el frontend (`loadSlots`)
- El endpoint `POST /api/bookings` no verifica la regla de 2 horas
- Riesgo: reservas creadas directamente vía API sin respetar la anticipación

### PEND-03: Vista "Mis reservas" para el cliente en oh-diosas
- No existe actualmente
- El cliente no puede ver ni cancelar sus reservas desde la web

### PEND-04: Apariencia y SEO en configuración (ocultos, no eliminados)
- Las secciones existen en el código pero están con `display:none`
- Pendiente de conectar `color_primario`, `color_acento` al frontend y CSS variables
- `meta_title` y `meta_description` pendientes de inyectar dinámicamente en HTML

### PEND-05: Chatbot n8n — manejo de estados reagendada / en_proceso
- El workflow actual conoce `confirmada`, `cancelada`, `no_asistio`
- Cuando una cita queda `reagendada`, el bot no informa activamente al cliente

### PEND-06: Multi-tenant (excluido de este ciclo por instrucción)
- Sistema diseñado para un spa; escalar a múltiples spas requiere campo `spa_id` en todas las tablas

### PEND-07: Carga de empleadas en modal de reagendamiento
- El modal muestra slots pero no informa qué empleada queda asignada tras reagendar
- El sistema asigna la empleada disponible automáticamente pero no lo muestra al admin

### PEND-08: Verificación de disponibilidad en reagendamiento vía la misma lógica que POST /api/bookings
- El modal de reagendamiento llama `GET /api/slots` para mostrar slots
- Pero al confirmar escribe directamente a BD sin pasar por el algoritmo de asignación
- Riesgo: reagendar puede no actualizar `empleado_id` si la empleada asignada ya no está disponible

---

*Fin del documento — próxima revisión al inicio del siguiente ciclo.*
