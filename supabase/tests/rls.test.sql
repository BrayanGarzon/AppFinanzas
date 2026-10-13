begin;
select plan(12);

insert into auth.users (id, email, encrypted_password, email_confirmed_at)
values
  ('10000000-0000-4000-8000-000000000001', 'owner@example.test', '', now()),
  ('10000000-0000-4000-8000-000000000002', 'other@example.test', '', now());

insert into public.accounts (id, user_id, name) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Cuenta propia'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Cuenta ajena');

insert into public.transactions (id, user_id, account_id, category_id, kind, amount_cop, transaction_date)
values ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000003', 'expense', 25000, current_date);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);

select is((select count(*)::integer from public.accounts), 1, 'solo se ven las cuentas propias');
select is((select count(*)::integer from public.transactions), 0, 'no se ven movimientos de otro usuario');
select lives_ok(
  $$insert into public.transactions (id, user_id, account_id, category_id, kind, amount_cop, transaction_date)
    values ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000003', 'expense', 100, current_date)$$,
  'se permite crear un gasto propio');
select lives_ok(
  $$update public.transactions set amount_cop = 200 where id = '30000000-0000-4000-8000-000000000001'$$,
  'se permite actualizar un movimiento propio');
select is((select amount_cop from public.transactions where id = '30000000-0000-4000-8000-000000000001'), 200::bigint, 'la actualización propia se guardó');
select lives_ok(
  $$delete from public.transactions where id = '30000000-0000-4000-8000-000000000001'$$,
  'se permite eliminar un movimiento propio');
select is((select count(*)::integer from public.transactions), 0, 'el movimiento propio quedó eliminado y el ajeno sigue oculto');
select throws_ok(
  $$insert into public.transactions (user_id, account_id, category_id, kind, amount_cop, transaction_date)
    values ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000003', 'expense', 100, current_date)$$,
  '42501', null, 'se bloquea usar la cuenta de otra persona');
select throws_ok(
  $$insert into public.transactions (user_id, account_id, category_id, kind, amount_cop, transaction_date)
    values ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000003', 'income', 100, current_date)$$,
  '42501', null, 'se bloquea un tipo que no coincide con la categoría');
select is((select count(*)::integer from public.profiles), 1, 'el perfil del usuario autenticado es privado');

reset role;
set local role anon;
select ok(not has_table_privilege('anon', 'public.transactions', 'select'), 'anon no tiene permiso para leer movimientos');
select throws_ok($$select * from public.transactions$$, '42501', null, 'anon no puede consultar movimientos');

reset role;
select * from finish();
rollback;
