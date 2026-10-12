# PocketFlow

Aplicación móvil privada para finanzas personales, pensada para uso personal en iPhone. El objetivo inicial es reemplazar el presupuesto en Excel, usar COP y mantener un costo recurrente de $0 COP.

## Alcance V1

- Registrar y consultar ingresos y gastos con fecha, categoría, descripción y cuenta.
- Consultar movimientos por mes y categoría, con saldos real, disponible y proyectado definidos por reglas documentadas.
- Administrar categorías y presupuestos mensuales por categoría.
- Registrar deudas, vencimientos, cuotas y abonos sin duplicar un egreso.
- Ver reportes mensuales y metas de ahorro.
- Persistir datos localmente y sincronizarlos con una cuenta Supabase protegida con RLS.
- Exportar y recuperar datos; instalación personal en iPhone sin publicación en tiendas.

### Fuera de V1

- Conexión automática a bancos, importación de extractos y pagos bancarios.
- Múltiples monedas, inversiones, impuestos, presupuestos compartidos o multiusuario.
- Backend propio, notificaciones de pago, transacciones recurrentes automatizadas.
- Publicación en App Store o Google Play.

## Stack y arquitectura

- React Native, Expo, TypeScript y Expo Router para aplicación y navegación.
- SQLite local como persistencia; Supabase Auth, PostgreSQL y API para sincronización remota.
- React Hook Form y Zod para formularios; TanStack Query cuando haya acceso remoto.
- Componentes bajo `src/components`, módulos por dominio bajo `src/features`, datos y validación en `src/services`, `src/schemas` y `src/types`.
- Migraciones SQL en `supabase/migrations`, documentación en `docs` y pruebas en `tests`.
- NativeWind y gráficas quedan sujetos a una prueba de compatibilidad con Expo antes de incorporarse.

## Requisitos de aceptación

1. La app se instala y abre en un iPhone sin publicarse en tiendas.
2. Ingresos, gastos e historial mensual persisten tras cerrar y abrir la app.
3. Los saldos y cálculos de COP son precisos y tienen pruebas de casos límite.
4. Los abonos de deuda no duplican gastos ni pagos.
5. Los datos remotos quedan aislados por usuario mediante RLS y no hay secretos en el cliente.
6. Se pueden exportar y recuperar datos.
7. El proceso de instalación, firma, reinstalación y actualización está documentado.

## Inicio

La app usa Expo Router con TypeScript y requiere Node.js 24.12 o posterior y npm. Instala las dependencias con `npm install` y ejecuta `npm start -- --tunnel` para abrir el servidor de Expo. Para probar en iPhone, instala Expo Go y escanea el QR que presenta Expo. La instalación independiente se aborda en la fase 11 y puede requerir firma de Apple.

## Fases

El alcance, decisiones, estado de fases y limitaciones están en [`docs/architecture.md`](docs/architecture.md), [`docs/financial-model.md`](docs/financial-model.md) y [`planner.md`](planner.md). Ejecuta `npm test` para probar las reglas financieras. El proyecto avanza en orden y las funcionalidades se implementan cuando su fase inicia.
