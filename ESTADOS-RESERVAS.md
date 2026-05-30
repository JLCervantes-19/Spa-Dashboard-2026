# Estados de Reservas — Spa Oh Diosas

## Tabla de estados

| Estado | Código | Color | Quién lo asigna | Descripción |
|--------|--------|-------|-----------------|-------------|
| Pendiente | `pendiente` | Gris | Sistema al crear | Reserva registrada, sin confirmar asignación |
| Confirmada | `confirmada` | Azul | Sistema tras asignación automática | Empleada asignada, reserva activa |
| En proceso | `en_proceso` | Amarillo | Empleada al iniciar el servicio | El servicio está siendo realizado |
| Realizada | `realizada` | Verde | Empleada al terminar | Servicio completado exitosamente |
| Atrasada | `atrasada` | Naranja | Empleada o sistema | Cliente llegó tarde o servicio no comenzó a tiempo |
| No asistió | `no_asistio` | Rojo | Empleada | Cliente no se presentó |
| Cancelada | `cancelada` | Rojo oscuro | Admin o cliente | Reserva anulada |
| Reagendada | `reagendada` | Morado | Admin | Se cambió fecha/hora; la empleada ve aviso |

## Transiciones permitidas

```
pendiente → confirmada (automático al asignar empleada)
confirmada → en_proceso (empleada al iniciar)
confirmada → atrasada (empleada o sistema)
confirmada → no_asistio (empleada)
confirmada → cancelada (admin)
confirmada → reagendada (admin)
en_proceso → realizada (empleada al terminar)
en_proceso → atrasada (si demora)
atrasada → en_proceso (cuando inicia con retraso)
atrasada → no_asistio (empleada)
reagendada → confirmada (nuevo slot asignado)
```

## Transiciones NO permitidas

- `realizada → cualquier otro` (estado terminal)
- `no_asistio → cualquier otro` (estado terminal)
- `cancelada → cualquier otro` (estado terminal)
- `pendiente → realizada` (saltar pasos)
- `pendiente → no_asistio` (saltar pasos)

## Por superficie

| Superficie | Puede asignar |
|-----------|---------------|
| oh-diosas (cliente) | — (solo sistema crea con `confirmada`) |
| staff-app (empleada) | en_proceso, realizada, atrasada, no_asistio, cancelada |
| admin-dashboard | todos los estados (cambio manual) + reagendada |
| sistema/API | pendiente, confirmada (asignación automática) |
