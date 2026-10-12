# PocketFlow — Planner maestro

## Objetivo
Desarrollar una aplicación móvil privada de finanzas personales para utilizar en el iPhone, reemplazando el presupuesto actual de Excel. No se publicará en App Store ni Google Play. El objetivo de costo recurrente es $0 COP.

## Stack tecnológico
- React Native + Expo + TypeScript
- Expo Router
- NativeWind, sujeto a compatibilidad
- Supabase Auth + PostgreSQL + API
- SQLite para persistencia local y futuro modo offline
- React Hook Form + Zod
- TanStack Query cuando sea necesario
- Git + GitHub
- Librería de gráficas compatible con Expo

## Arquitectura
- app/: pantallas y navegación
- src/components/: componentes reutilizables
- src/features/: dashboard, transactions, categories, budgets, debts, goals y reports
- src/lib/: configuración y clientes
- src/services/: acceso a datos
- src/hooks/: hooks reutilizables
- src/schemas/: validaciones
- src/types/: tipos TypeScript
- src/utils/: utilidades
- src/constants/: constantes
- supabase/migrations/: migraciones SQL
- supabase/seed.sql: datos iniciales de prueba
- docs/: arquitectura, base de datos, roadmap y decisiones
- tests/: pruebas
- README.md: instalación, ejecución y documentación

## Fase 00 — Definición y alcance
- [x] Definir funcionalidades de la V1 y exclusiones
- [x] Documentar arquitectura y stack
- [ ] Crear repositorio GitHub
- [x] README inicial
- [x] Definir criterios de aceptación

## Fase 01 — Entorno y aplicación base
- [x] Verificar Node.js y npm en Mac
- [x] Crear proyecto Expo con TypeScript
- [x] Configurar navegación y estructura inicial
- [ ] Confirmar apertura en iPhone con Expo Go (servidor con túnel activo; falta validación en el dispositivo)

## Fase 02 — Diseño y experiencia móvil
- [x] Definir colores, tipografía e iconografía
- [x] Diseñar dashboard y navegación inferior
- [x] Diseñar formularios de ingresos y gastos
- [x] Adaptar pantallas al iPhone

## Fase 03 — Modelo financiero
- [x] Modelar cuentas, movimientos y categorías
- [x] Definir ingresos, gastos, transferencias y pagos de deuda
- [x] Diferenciar saldo real, disponible y proyectado
- [x] Crear pruebas de cálculos y casos límite

## Fase 04 — Dashboard y operaciones locales
- [x] Construir dashboard con saldos y movimientos recientes de SQLite
- [x] Crear, editar y eliminar ingresos y gastos
- [x] Filtrar por mes y categoría
- [x] Persistir datos locales

## Fase 05 — Supabase y seguridad
- [ ] Crear proyecto Supabase gratuito
- [ ] Crear migraciones y tablas PostgreSQL
- [ ] Configurar autenticación y políticas RLS
- [ ] Conectar la app y probar permisos

## Fase 06 — Presupuestos y categorías
- [ ] Crear categorías personalizadas
- [ ] Definir presupuestos mensuales y por categoría
- [ ] Mostrar consumido, restante y porcentaje
- [ ] Mostrar alertas por límites excedidos

## Fase 07 — Deudas y cuotas
- [ ] Registrar deudas, saldos y cuotas
- [ ] Configurar vencimientos
- [ ] Registrar abonos y recalcular saldos
- [ ] Evitar duplicar gastos y pagos de deuda

## Fase 08 — Reportes y metas
- [ ] Crear gráficas de ingresos y gastos
- [ ] Mostrar distribución por categorías
- [ ] Comparar meses
- [ ] Crear metas de ahorro

## Fase 09 — Sincronización y modo offline
- [ ] Definir SQLite como almacenamiento local
- [ ] Crear cola de operaciones pendientes
- [ ] Sincronizar al recuperar conexión
- [ ] Resolver duplicados y conflictos

## Fase 10 — Calidad, privacidad y respaldos
- [ ] Probar cálculos, formularios y persistencia
- [ ] Revisar RLS, permisos y secretos
- [ ] Implementar exportación y recuperación de datos
- [ ] Probar errores y pérdida de conexión

## Fase 11 — Instalación personal en iPhone
- [ ] Probar en dispositivo físico
- [ ] Generar build iOS
- [ ] Instalar y verificar apertura independiente
- [ ] Documentar firma, reinstalación y actualizaciones
- [ ] Evitar publicación en App Store

## Fase 12 — Pulido y versión 1.0
- [ ] Corregir errores
- [ ] Mejorar rendimiento y accesibilidad
- [ ] Etiquetar versión 1.0.0 en Git
- [ ] Actualizar README y documentación

## Modelo de datos previsto
- profiles
- accounts
- categories
- transactions
- debts
- debt_payments
- budgets
- budget_categories
- goals
- recurring_transactions

## Reglas técnicas
- No usar Flutter
- No desarrollar backend Node.js propio inicialmente
- No pagar servicios recurrentes si los planes gratuitos son suficientes
- No publicar en tiendas
- No incluir secretos en el cliente
- Proteger datos con Supabase RLS
- Usar COP y cálculos monetarios precisos
- No contabilizar una cuota de deuda dos veces
- Documentar decisiones y cerrar cada fase con Git

## Criterios de aceptación de V1
- La app se instala y abre en el iPhone sin App Store
- Los movimientos persisten al cerrar la app
- Ingresos, gastos e historial mensual funcionan
- Los saldos se calculan correctamente
- Deudas y abonos no duplican operaciones
- Los datos remotos están protegidos
- Existen pruebas de cálculos y respaldos
- El repositorio está documentado y versionado

## Presupuesto objetivo
$0 COP mensuales al comenzar. Los planes gratuitos, las restricciones de firma de iOS y los límites de servicios se verificarán antes de depender de ellos.

## Primer hito
1. Verificar Node.js y npm
2. Crear repositorio pocketflow
3. Crear aplicación Expo + TypeScript
4. Ejecutar en iPhone con Expo Go
5. Guardar el estado inicial en Git

## Metodología
Avanzar fase por fase. No implementar módulos futuros antes de que sean necesarios. Al cerrar cada fase, registrar tareas completadas, pruebas, decisiones y siguiente objetivo.
