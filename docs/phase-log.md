# Registro de fases y comprobaciones

## Fase 00 — Alcance y arquitectura

- Alcance de V1, exclusiones, stack y criterios de aceptación registrados en `README.md` y `docs/architecture.md`.
- Repositorio Git local creado en la rama `main`.
- Repositorio GitHub remoto pendiente: no hay conexión autenticada configurada.

## Fase 01 — Aplicación base

- Node.js 24.18.0 y npm 11.16.0 comprobados.
- Plantilla Expo `tabs` con TypeScript inicializada; dependencias instaladas.
- `npx tsc --noEmit`: pasó.
- `npx expo install --check`: dependencias alineadas según el mapa local de SDK 57; Expo no pudo consultar el endpoint público de versiones.
- Expo Doctor: 20 de 21 comprobaciones pasaron; la comprobación de React Native Directory falló porque el servicio devolvió una respuesta inesperada.
- La prueba inicial con túnel público se detuvo por el control de seguridad; el bundle no se solicitó mediante ese túnel.
- La usuaria confirmó apertura y uso básico desde Expo Go con el servidor LAN y la misma cuenta Expo en el teléfono y CLI.

## Fase 02 — Diseño móvil

- Dashboard de muestra, navegación inferior de cuatro secciones y formularios visuales de ingreso/gasto creados.
- TypeScript pasó y `npx expo export --platform web --clear` generó correctamente las 11 rutas.
- Las cifras son demostrativas y el formulario todavía no guarda operaciones; el guardado corresponde a fase 04.

## Fase 03 — Modelo financiero

- Modelo de cuentas, categorías, ingresos, gastos, transferencias, pagos de deuda y estados planificados documentado en `docs/financial-model.md`.
- `npm test`: 7 pruebas pasaron, 0 fallaron.
- `npx tsc --noEmit`: pasó.
- `npx expo install --check`: dependencias alineadas usando el mapa local.

## Fase 04 — Dashboard y operaciones locales

- SQLite inicializa la cuenta principal y categorías del sistema; ingresos y gastos se guardan localmente en COP entero.
- Dashboard usa el saldo real y los totales del mes; formulario permite crear, editar y eliminar, elegir categoría y fecha.
- Actividad filtra por mes y categoría y abre movimientos existentes para editarlos.
- `npm test`: 9 pruebas pasaron, 0 fallaron, incluidas migración, persistencia, edición, borrado, filtros y validaciones SQLite.
- `npx tsc --noEmit`: pasó.
- `npx expo export --platform ios --clear`: bundle iOS generado correctamente.
- Expo Go físico validado en iPhone; se corrigió un error de estilos en enlaces al renderizar movimientos recientes y se volvió a exportar iOS.
- Decisión: mantener modo claro en esta fase; el catálogo de categorías personalizadas y los presupuestos quedan para Fase 06.

## Fase 05 — Supabase y seguridad (en curso)

- Cliente Supabase opcional, sesión persistente y controles de crear cuenta/iniciar sesión añadidos en Más; sin `.env`, la app mantiene SQLite local.
- Migración de perfiles, cuentas, categorías, movimientos, grants y políticas RLS creada; semilla de categorías de sistema añadida.
- Pruebas pgTAP de aislamiento, CRUD y validación de cuenta/categoría creadas en `supabase/tests/rls.test.sql`.
- `npm test`: 11 pruebas pasaron, 0 fallaron (incluye comprobaciones estáticas de seguridad SQL).
- `npx tsc --noEmit`: pasó. Exportaciones iOS y web generadas; se añadió soporte Metro para el asset WASM de SQLite web (Expo lo considera alpha).
- Docker CLI existe, pero Docker Desktop no está instalado/iniciado; no se pudo ejecutar `npx supabase test db`. Tampoco existe proyecto Supabase enlazado, así que no se aplicó la migración ni se verificó auth remoto.
- Pasos para terminar y configurar credenciales locales sin exponer secretos en [`supabase.md`](supabase.md).
