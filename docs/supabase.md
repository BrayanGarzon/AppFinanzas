# Supabase — configuración y seguridad

PocketFlow conserva SQLite como almacenamiento local. La Fase 05 añade autenticación y el esquema remoto inicial; la sincronización de movimientos entre SQLite y PostgreSQL queda para la Fase 09.

## Tablas y permisos

La migración `supabase/migrations/20261012000100_initial_finance_schema.sql` crea `profiles`, `accounts`, `categories` y `transactions`. Cada tabla tiene RLS; solo `authenticated` recibe privilegios. Las políticas limitan filas al usuario autenticado. Los movimientos también validan que la cuenta pertenezca al usuario y que la categoría coincida con el tipo. Las categorías de sistema son de solo lectura.

El alta de Auth crea automáticamente una fila privada en `profiles`. `supabase/seed.sql` agrega las categorías de sistema usadas por la app.

## Crear y enlazar un proyecto

1. Crea un proyecto en [Supabase Dashboard](https://supabase.com/dashboard) dentro de tu cuenta. Guarda la contraseña de base de datos en tu gestor de contraseñas; no la pongas en el código ni la compartas en el chat.
2. Instala/inicia Docker Desktop para las pruebas locales. Desde la raíz del repositorio ejecuta `npx supabase start` y `npx supabase test db` para validar la migración y los casos pgTAP de `supabase/tests/rls.test.sql`.
3. Inicia sesión en el CLI con `npx supabase login`, enlaza el proyecto con `npx supabase link --project-ref <project-ref>` y aplica migración y semillas con `npx supabase db push --include-seed`. El CLI pedirá la contraseña de la base de datos localmente.
4. En **Project Settings → API**, copia la Project URL y la publishable key. Copia `.env.example` a `.env` y pega esos dos valores. No uses una secret key ni `service_role` en Expo.
5. Reinicia Expo con `npm run start:lan`, abre **Más → Cuenta Supabase**, crea un usuario de prueba y confirma el correo si Supabase lo solicita. Al iniciar sesión, el panel consulta el perfil propio mediante RLS.

`EXPO_PUBLIC_*` se incorpora al bundle móvil y por eso solo debe contener la URL y la publishable key. La seguridad de los datos depende de RLS; el cliente nunca recibe la clave privilegiada.

## Estado

Migración, semilla, cliente opcional y pantalla de Auth están preparados. La migración aún no está desplegada ni pgTAP ejecutado: falta crear/enlazar el proyecto y disponer de Docker iniciado. La política se prueba con dos usuarios: uno puede leer, insertar, actualizar y eliminar sus movimientos, no puede leer al otro y no puede usar la cuenta de otro usuario.
