import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migration = await readFile(new URL('../supabase/migrations/20261012000100_initial_finance_schema.sql', import.meta.url), 'utf8');
const accountPanel = await readFile(new URL('../src/components/SupabaseAccountPanel.tsx', import.meta.url), 'utf8');
const client = await readFile(new URL('../src/lib/supabase.ts', import.meta.url), 'utf8');

test('remote finance tables have RLS and authenticated-only access policies', () => {
  for (const table of ['profiles', 'accounts', 'categories', 'transactions']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
  assert.match(migration, /for all to authenticated/i);
  assert.match(migration, /for select to authenticated/i);
  assert.match(migration, /for insert to authenticated/i);
  assert.match(migration, /for update to authenticated/i);
  assert.match(migration, /for delete to authenticated/i);
  assert.match(migration, /revoke all .* from public, anon/i);
  assert.match(migration, /auth\.uid\(\)/i);
  assert.doesNotMatch(client, /service_role|secret key/i);
});

test('app checks the signed-in user profile through RLS and accepts only the publishable key', () => {
  assert.match(accountPanel, /from\('profiles'\)\.select\('id'\)/);
  assert.match(client, /EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(client, /EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY|service_role/);
});
