# Arquitectura y decisiones iniciales

## Objetivo y alcance

PocketFlow será una aplicación privada de finanzas personales para iPhone, reemplazo del presupuesto actual en Excel. V1 cubre movimientos de ingresos y gastos, cuentas y categorías, saldos, presupuestos, deudas y abonos, reportes y metas, respaldo y sincronización protegida. Se excluyen conexiones bancarias, inversiones, múltiples monedas, uso compartido y publicación en tiendas.

## Arquitectura prevista

La interfaz móvil se implementa con React Native, Expo, TypeScript y Expo Router. Se organiza por dominios en `src/features` y componentes comunes en `src/components`. Los formularios usan React Hook Form y Zod. SQLite es la persistencia local. Supabase provee autenticación y almacenamiento remoto PostgreSQL con RLS; la lógica de acceso queda encapsulada en servicios. TanStack Query se agrega cuando exista sincronización remota. Las migraciones viven en `supabase/migrations`.

La V1 prioriza uso local confiable. La sincronización y resolución de conflictos se diseñan en fases 05 y 09, sin introducir una API propia. Los secretos de administración nunca se incluyen en el cliente.

## Decisiones de producto y datos

- La moneda inicial es COP. Los valores se almacenarán como enteros en la unidad monetaria menor o usando una representación decimal exacta; no se usarán `float` para cálculos contables. La unidad y redondeo concretos se fijarán con el modelo financiero en fase 03.
- Un movimiento tiene un tipo explícito. Las transferencias mueven saldo entre cuentas sin alterar ingresos o gastos netos.
- Un pago de deuda deberá vincularse a su deuda y generar un único efecto de caja. El modelo de fase 03 definirá cómo separar capital, interés y comisiones sin contabilizar dos veces.
- Saldo real, disponible y proyectado tendrán definiciones distintas documentadas junto con casos de prueba antes de implementar cálculos.
- Los datos remotos se particionan por propietario y se validan mediante RLS para cada tabla expuesta.
- No se automatizan movimientos recurrentes en V1; el modelo puede admitir su configuración futura.

## Criterios de aceptación V1

1. Instalación y apertura en iPhone sin publicación en tiendas.
2. Ingresos, gastos e historial por mes se guardan y sobreviven reinicios.
3. Saldos y operaciones de COP son correctos, incluidos casos límite cubiertos por pruebas.
4. Deudas y abonos no duplican una operación.
5. RLS aísla usuarios y el cliente no contiene secretos privilegiados.
6. Exportación y recuperación de datos disponibles.
7. Repositorio y documentación explican ejecución, firma e instalación personal.

## Decisiones por validar

- Compatibilidad de NativeWind y librería de gráficas con la versión de Expo elegida.
- Estrategia y límites gratuitos de Supabase y firma/distribución iOS antes de depender de ellos.
- Precisión y redondeo final de COP, cuentas y definición de saldo en la fase 03.
- SQLite y sincronización en fase 09, incluyendo reintentos e idempotencia.

## Estado de fase 00

Alcance, exclusiones, arquitectura base y criterios de aceptación definidos. Se inicializó el repositorio Git local. La creación del repositorio GitHub y la conexión remota quedan pendientes porque no hay una conexión autenticada disponible en este entorno.

## Estado de fase 01

Proyecto Expo con TypeScript y Expo Router creado a partir de la plantilla oficial `tabs` (SDK 57). Navegación base configurada; `npm start -- --tunnel` levantó Metro y generó el QR `exp://xobcpo0-anonymous-8081.exp.direct`. Queda pendiente confirmar la apertura desde el iPhone físico.

SDK 57 requiere iOS 16.4 o posterior según su referencia oficial. Confirmar que el iPhone de destino cumple antes de cerrar la validación de Expo Go.

## Estado de fase 02

Diseño inicial aplicado con paleta verde, tarjetas, navegación inferior de cuatro secciones, dashboard de muestra y formularios de ingreso/gasto. Los formularios y los montos del dashboard son solo visuales; operaciones y cálculos se habilitan en las fases 03 y 04. Se usan estilos nativos de React Native; NativeWind se deja fuera hasta verificar que aporta compatibilidad y beneficio.

### Decisiones visuales

- Interfaz en español y COP, optimizada para retrato de iPhone con `SafeAreaView`, `ScrollView` y campos adaptados al teclado iOS.
- Verde bosque para identidad y saldo; verde claro para ingresos; rojo tenue para egresos; fondo marfil y tarjetas blancas.
- Iconos SF Symbols en iOS con símbolos de respaldo para Android/Web.
- Los números de dashboard son datos de demostración y están marcados como tales; todavía no representan persistencia real.

## Estado de fase 03

El modelo de tipos y cálculos está en `src/types/finance.ts` y `src/features/finance/calculations.ts`. Los saldos usan pesos enteros COP. La definición de saldos, pagos de deuda y casos límite está en [`financial-model.md`](financial-model.md). `npm test` ejecuta las pruebas de cálculo con el test runner de Node.
