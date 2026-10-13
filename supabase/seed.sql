insert into public.categories (id, user_id, name, kind, is_system) values
  ('50000000-0000-4000-8000-000000000001', null, 'Salario', 'income', true),
  ('50000000-0000-4000-8000-000000000002', null, 'Otros ingresos', 'income', true),
  ('50000000-0000-4000-8000-000000000003', null, 'Alimentación', 'expense', true),
  ('50000000-0000-4000-8000-000000000004', null, 'Hogar', 'expense', true),
  ('50000000-0000-4000-8000-000000000005', null, 'Transporte', 'expense', true),
  ('50000000-0000-4000-8000-000000000006', null, 'Salud', 'expense', true),
  ('50000000-0000-4000-8000-000000000007', null, 'Otros gastos', 'expense', true)
on conflict (id) do nothing;
