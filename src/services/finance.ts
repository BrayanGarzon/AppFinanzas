import type { Account, Category, Cop, Transaction } from '../types/finance.ts';
import type { StoredTransaction } from '../types/finance.ts';
import { calculateFinancialSummary } from '../features/finance/calculations.ts';
import { getMonthBounds } from '../utils/dates.ts';

export type SqlValue = string | number | null;

/** Minimal Expo SQLite API used here; it also keeps repository tests independent of native bindings. */
export interface FinanceDatabase {
  execAsync(source: string): Promise<void>;
  getFirstAsync<T>(source: string, ...params: SqlValue[]): Promise<T | null>;
  getAllAsync<T>(source: string, ...params: SqlValue[]): Promise<T[]>;
  runAsync(source: string, ...params: SqlValue[]): Promise<{ lastInsertRowId: number; changes: number }>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export interface SaveTransactionInput {
  id?: string;
  kind: 'income' | 'expense';
  categoryId: string;
  amountCop: Cop;
  date: string;
  description: string;
}

export interface TransactionFilters {
  month: Date;
  categoryId?: string;
}

interface TransactionRow {
  id: string;
  kind: 'income' | 'expense';
  account_id: string;
  category_id: string;
  category_name: string;
  category_symbol: string;
  amount_cop: number;
  date: string;
  description: string;
}

const defaultCategories: Category[] = [
  { id: 'income-salary', name: 'Salario', kind: 'income', isSystem: true },
  { id: 'income-other', name: 'Otros ingresos', kind: 'income', isSystem: true },
  { id: 'expense-food', name: 'Alimentación', kind: 'expense', isSystem: true },
  { id: 'expense-home', name: 'Hogar', kind: 'expense', isSystem: true },
  { id: 'expense-transport', name: 'Transporte', kind: 'expense', isSystem: true },
  { id: 'expense-health', name: 'Salud', kind: 'expense', isSystem: true },
  { id: 'expense-other', name: 'Otros gastos', kind: 'expense', isSystem: true },
];

const categorySymbols: Record<string, string> = {
  'income-salary': 'briefcase.fill',
  'income-other': 'plus.circle.fill',
  'expense-food': 'basket.fill',
  'expense-home': 'house.fill',
  'expense-transport': 'car.fill',
  'expense-health': 'cross.case.fill',
  'expense-other': 'tag.fill',
};

export async function initializeFinanceDatabase(db: FinanceDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((version?.user_version ?? 0) >= 1) return;

  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        opening_balance_cop INTEGER NOT NULL DEFAULT 0 CHECK(opening_balance_cop >= 0)
      );
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        kind TEXT NOT NULL CHECK(kind IN ('income', 'expense')),
        is_system INTEGER NOT NULL DEFAULT 0 CHECK(is_system IN (0, 1))
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        kind TEXT NOT NULL CHECK(kind IN ('income', 'expense')),
        account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
        category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        amount_cop INTEGER NOT NULL CHECK(amount_cop > 0 AND amount_cop <= 9007199254740991),
        date TEXT NOT NULL CHECK(date GLOB '????-??-??'),
        description TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date DESC, created_at DESC);
      CREATE INDEX IF NOT EXISTS transactions_category_idx ON transactions(category_id, date DESC);
      INSERT OR IGNORE INTO accounts (id, name, opening_balance_cop) VALUES ('account-main', 'Cuenta principal', 0);
    `);
    for (const category of defaultCategories) {
      await db.runAsync(
        'INSERT OR IGNORE INTO categories (id, name, kind, is_system) VALUES (?, ?, ?, 1)',
        category.id,
        category.name,
        category.kind,
      );
    }
    await db.execAsync('PRAGMA user_version = 1;');
  });
}

export async function getCategories(db: FinanceDatabase, kind?: Category['kind']): Promise<Category[]> {
  const rows = kind
    ? await db.getAllAsync<{ id: string; name: string; kind: Category['kind']; is_system: number }>(
        'SELECT id, name, kind, is_system FROM categories WHERE kind = ? ORDER BY name COLLATE NOCASE',
        kind,
      )
    : await db.getAllAsync<{ id: string; name: string; kind: Category['kind']; is_system: number }>(
        'SELECT id, name, kind, is_system FROM categories ORDER BY name COLLATE NOCASE',
      );
  return rows.map((row) => ({ id: row.id, name: row.name, kind: row.kind, isSystem: row.is_system === 1 }));
}

function mapTransaction(row: TransactionRow): StoredTransaction {
  return {
    id: row.id,
    kind: row.kind,
    accountId: row.account_id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySymbol: row.category_symbol,
    amountCop: row.amount_cop,
    date: row.date,
    description: row.description,
  };
}

const transactionSelect = `
  SELECT t.id, t.kind, t.account_id, t.category_id, c.name AS category_name,
    t.amount_cop, t.date, t.description
  FROM transactions t JOIN categories c ON c.id = t.category_id
`;

export async function getTransactions(db: FinanceDatabase, filters?: TransactionFilters): Promise<StoredTransaction[]> {
  if (!filters) {
    const rows = await db.getAllAsync<TransactionRow>(`${transactionSelect} ORDER BY t.date DESC, t.created_at DESC`);
    return rows.map((row) => mapTransaction({ ...row, category_symbol: categorySymbols[row.category_id] ?? 'tag.fill' }));
  }
  const bounds = getMonthBounds(filters.month);
  const rows = await db.getAllAsync<TransactionRow>(
    `${transactionSelect} WHERE t.date >= ? AND t.date < ? AND (? IS NULL OR t.category_id = ?) ORDER BY t.date DESC, t.created_at DESC`,
    bounds.startDate,
    bounds.endDateExclusive,
    filters.categoryId ?? null,
    filters.categoryId ?? null,
  );
  return rows.map((row) => mapTransaction({ ...row, category_symbol: categorySymbols[row.category_id] ?? 'tag.fill' }));
}

export async function getTransaction(db: FinanceDatabase, id: string): Promise<StoredTransaction | null> {
  const row = await db.getFirstAsync<TransactionRow>(`${transactionSelect} WHERE t.id = ?`, id);
  return row ? mapTransaction({ ...row, category_symbol: categorySymbols[row.category_id] ?? 'tag.fill' }) : null;
}

export async function saveTransaction(
  db: FinanceDatabase,
  input: SaveTransactionInput,
): Promise<void> {
  if (!Number.isSafeInteger(input.amountCop) || input.amountCop <= 0) throw new RangeError('Amount must be a positive whole-peso COP value');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || new Date(`${input.date}T00:00:00.000Z`).toISOString().slice(0, 10) !== input.date) throw new RangeError('Date must be a valid YYYY-MM-DD date');
  const category = await db.getFirstAsync<{ kind: string }>('SELECT kind FROM categories WHERE id = ?', input.categoryId);
  if (!category || category.kind !== input.kind) throw new RangeError('Category must match the transaction type');
  if (input.id) {
    await db.runAsync(
      'UPDATE transactions SET kind = ?, category_id = ?, amount_cop = ?, date = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      input.kind,
      input.categoryId,
      input.amountCop,
      input.date,
      input.description,
      input.id,
    );
    return;
  }
  await db.runAsync(
    'INSERT INTO transactions (kind, account_id, category_id, amount_cop, date, description) VALUES (?, ?, ?, ?, ?, ?)',
    input.kind,
    'account-main',
    input.categoryId,
    input.amountCop,
    input.date,
    input.description,
  );
}

export async function deleteTransaction(db: FinanceDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
}

export async function getFinanceDashboard(db: FinanceDatabase, month = new Date()): Promise<{
  summary: ReturnType<typeof calculateFinancialSummary>;
  recent: StoredTransaction[];
}> {
  const accounts = await db.getAllAsync<{ id: string; name: string; opening_balance_cop: number }>(
    'SELECT id, name, opening_balance_cop FROM accounts',
  );
  const transactions = await db.getAllAsync<TransactionRow>(
    `${transactionSelect} ORDER BY t.date DESC, t.created_at DESC`,
  );
  const mapped = transactions.map((row) => mapTransaction({ ...row, category_symbol: categorySymbols[row.category_id] ?? 'tag.fill' }));
  const modelTransactions: Transaction[] = mapped.map((transaction) => ({
    id: transaction.id,
    date: transaction.date,
    status: 'posted',
    kind: transaction.kind,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    amountCop: transaction.amountCop,
    note: transaction.description,
  }));
  const accountModels: Account[] = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    openingBalanceCop: account.opening_balance_cop,
  }));
  const monthBounds = getMonthBounds(month);
  const monthTransactions = mapped.filter((transaction) => transaction.date >= monthBounds.startDate && transaction.date < monthBounds.endDateExclusive);
  const incomeCop = monthTransactions.filter((transaction) => transaction.kind === 'income').reduce((total, transaction) => total + transaction.amountCop, 0);
  const expenseCop = monthTransactions.filter((transaction) => transaction.kind === 'expense').reduce((total, transaction) => total + transaction.amountCop, 0);
  return {
    summary: { ...calculateFinancialSummary(accountModels, modelTransactions), incomeCop, expenseCop },
    recent: mapped.slice(0, 3),
  };
}

