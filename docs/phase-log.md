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
- Metro inició con túnel y el endpoint `/status` respondió `packager-status:running`. El túnel se detuvo después de que el control de seguridad rechazara solicitar el bundle iOS mediante una URL pública de terceros. No se envió el bundle iOS ni se confirmó la apertura en el teléfono.
- Pendiente: abrir la app con Expo Go desde el iPhone usando un servidor local en la misma red Wi-Fi.

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
- Expo Go físico pendiente: el entorno aislado bloquea interfaces de red (`Networking has been disabled`). En la Mac, dentro de la carpeta del proyecto y conectado al mismo Wi-Fi del iPhone, ejecutar `npx expo start --lan`; abrir PocketFlow con Expo Go escaneando el QR. No usar `--tunnel`.
- Decisión: mantener modo claro en esta fase; el catálogo de categorías personalizadas y los presupuestos quedan para Fase 06.
