# Modelo financiero inicial

## Cantidades y COP

Los importes se guardan como números enteros de pesos COP. Se rechazan fracciones y valores fuera del rango entero seguro de JavaScript. El formato localizado se hace solo en la presentación; no se calculan saldos con `float` ni con strings formateados.

## Entidades

- **Account:** `id`, nombre y saldo de apertura en COP.
- **Category:** `id`, nombre, tipo ingreso/gasto e indicador de categoría de sistema.
- **Income:** cuenta, categoría de ingreso y cantidad positiva.
- **Expense:** cuenta, categoría de gasto y cantidad positiva.
- **Transfer:** cuenta origen, cuenta destino y cantidad positiva. Las cuentas deben ser distintas.
- **Debt payment:** deuda, cuenta de salida y componentes de capital, interés y comisión, todos no negativos y sumando al menos un peso.
- **Debt:** saldo de capital de apertura. Los pagos reducen el capital por el componente principal.

Todos los movimientos tienen fecha y estado `posted` o `planned`.

## Definición de saldos

- **Real:** suma de saldos de apertura más ingresos contabilizados, menos gastos y pagos de deuda contabilizados. Transferencias cambian las cuentas individuales, pero no el total del hogar.
- **Disponible:** saldo real menos las reservas explícitas para obligaciones pendientes o metas. Los topes de presupuesto no reservan dinero por sí solos.
- **Proyectado:** saldo real más el neto de movimientos planificados. Lo planificado no cambia el saldo real ni el disponible.
- Los saldos por cuenta incluyen sus transferencias de entrada y salida; el total familiar no duplica una transferencia.

## Deudas y doble contabilización

Un pago de deuda es un único movimiento de caja por la suma de capital, interés y comisiones. El capital reduce el saldo de la deuda; solo interés y comisiones se suman a gastos. No se agrega además un gasto por el mismo pago ni por sus componentes. Los pagos planificados no reducen el saldo actual de la deuda.

La fase de operaciones deberá aplicar esta regla desde el formulario y guardar el pago y sus componentes como una sola unidad. Los pagos de capital mayores al saldo registrado se rechazan para evitar saldos de deuda negativos.

## Casos probados

- Cálculo por cuenta y saldo total con ingresos, gastos y pago de deuda.
- Transferencia entre cuentas sin alterar saldo familiar ni total de gastos.
- Diferencia entre capital cancelado y costo financiero.
- Separación entre movimientos contabilizados y planificados.
- Saldo disponible tras restar reservas.
- Rechazo de fracciones de peso, transferencias a la misma cuenta y sobrepagos de capital.
