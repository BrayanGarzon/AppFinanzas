import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';

import { deleteTransaction, getCategories, getFinanceDashboard, getTransaction, getTransactions, initializeFinanceDatabase, saveTransaction } from '../src/services/finance.ts';
import type { FinanceDatabase, SqlValue } from '../src/services/finance.ts';

function createDatabase(): { db: FinanceDatabase; close: () => void } {
  const raw = new DatabaseSync(':memory:');
  const db: FinanceDatabase = {
    execAsync: async (sql) => { raw.exec(sql); },
    getFirstAsync: async <T>(sql: string, ...params: SqlValue[]) => (raw.prepare(sql).get(...params) as T | undefined) ?? null,
    getAllAsync: async <T>(sql: string, ...params: SqlValue[]) => raw.prepare(sql).all(...params) as T[],
    runAsync: async (sql, ...params) => { const result = raw.prepare(sql).run(...params); return { lastInsertRowId: Number(result.lastInsertRowid), changes: Number(result.changes) }; },
    withTransactionAsync: async (task) => { raw.exec('BEGIN'); try { await task(); raw.exec('COMMIT'); } catch (error) { raw.exec('ROLLBACK'); throw error; } },
  };
  return { db, close: () => raw.close() };
}

test('SQLite repository persists, filters, updates and deletes transactions', async () => {
  const { db, close } = createDatabase();
  try {
    await initializeFinanceDatabase(db);
    await initializeFinanceDatabase(db);
    const categories = await getCategories(db, 'expense');
    assert.ok(categories.some((category) => category.id === 'expense-food'));
    await saveTransaction(db, { kind: 'expense', categoryId: 'expense-food', amountCop: 125_000, date: '2026-10-12', description: 'Mercado' });
    await saveTransaction(db, { kind: 'income', categoryId: 'income-salary', amountCop: 2_000_000, date: '2026-09-01', description: 'Nómina' });
    const october = await getTransactions(db, { month: new Date(2026, 9, 1) });
    assert.equal(october.length, 1);
    assert.equal(october[0].categoryName, 'Alimentación');
    assert.equal(october[0].amountCop, 125_000);
    const id = october[0].id;
    await saveTransaction(db, { id, kind: 'expense', categoryId: 'expense-home', amountCop: 90_000, date: '2026-10-10', description: 'Arriendo parcial' });
    assert.equal((await getTransaction(db, id))?.amountCop, 90_000);
    const dashboard = await getFinanceDashboard(db, new Date(2026, 9, 1));
    assert.equal(dashboard.summary.realBalanceCop, 1_910_000);
    assert.equal(dashboard.summary.expenseCop, 90_000);
    await deleteTransaction(db, id);
    assert.equal(await getTransaction(db, id), null);
  } finally { close(); }
});

test('SQLite repository rejects invalid whole-peso amounts and date strings', async () => {
  const { db, close } = createDatabase();
  try {
    await initializeFinanceDatabase(db);
    await assert.rejects(saveTransaction(db, { kind: 'expense', categoryId: 'expense-food', amountCop: 1.25, date: '2026-10-12', description: '' }), /positive whole-peso/);
    await assert.rejects(saveTransaction(db, { kind: 'expense', categoryId: 'expense-food', amountCop: 1, date: '12-10-2026', description: '' }), /valid YYYY-MM-DD/);
    await assert.rejects(saveTransaction(db, { kind: 'expense', categoryId: 'expense-food', amountCop: 1, date: '2026-02-30', description: '' }), /valid YYYY-MM-DD/);
    await assert.rejects(saveTransaction(db, { kind: 'expense', categoryId: 'income-salary', amountCop: 1, date: '2026-10-12', description: '' }), /match the transaction type/);
  } finally { close(); }
});
