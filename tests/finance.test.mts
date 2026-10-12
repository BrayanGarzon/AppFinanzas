import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateDebtBalance, calculateFinancialSummary } from '../src/features/finance/calculations.ts';
import type { Account, Debt, Transaction } from '../src/types/finance.ts';
import { formatCop } from '../src/utils/money.ts';

const accounts: Account[] = [
  { id: 'checking', name: 'Cuenta principal', openingBalanceCop: 500_000 },
  { id: 'savings', name: 'Ahorros', openingBalanceCop: 250_000 },
];

const transactions: Transaction[] = [
  { id: 'salary', date: '2026-10-01', status: 'posted', kind: 'income', accountId: 'checking', categoryId: 'salary', amountCop: 1_000_000 },
  { id: 'groceries', date: '2026-10-02', status: 'posted', kind: 'expense', accountId: 'checking', categoryId: 'food', amountCop: 150_000 },
  { id: 'transfer', date: '2026-10-03', status: 'posted', kind: 'transfer', fromAccountId: 'checking', toAccountId: 'savings', amountCop: 200_000 },
  { id: 'loan-payment', date: '2026-10-04', status: 'posted', kind: 'debt_payment', accountId: 'checking', debtId: 'loan', principalCop: 100_000, interestCop: 5_000, feeCop: 0 },
  { id: 'planned-income', date: '2026-10-20', status: 'planned', kind: 'income', accountId: 'checking', categoryId: 'salary', amountCop: 50_000 },
  { id: 'planned-expense', date: '2026-10-21', status: 'planned', kind: 'expense', accountId: 'checking', categoryId: 'food', amountCop: 25_000 },
  { id: 'planned-payment', date: '2026-10-22', status: 'planned', kind: 'debt_payment', accountId: 'checking', debtId: 'loan', principalCop: 20_000, interestCop: 1_000, feeCop: 0 },
];

test('whole-peso COP balances include posted cash movements only', () => {
  const result = calculateFinancialSummary(accounts, transactions, 200_000);
  assert.deepEqual(result.accountBalancesCop, { checking: 1_045_000, savings: 450_000 });
  assert.equal(result.realBalanceCop, 1_495_000);
  assert.equal(result.availableBalanceCop, 1_295_000);
  assert.equal(result.projectedBalanceCop, 1_499_000);
});

test('transfers move funds between accounts but do not change household balance or spending', () => {
  const before = calculateFinancialSummary(accounts, [], 0);
  const after = calculateFinancialSummary(accounts, [transactions[2]], 0);
  assert.equal(before.realBalanceCop, after.realBalanceCop);
  assert.equal(after.accountBalancesCop.checking, 300_000);
  assert.equal(after.accountBalancesCop.savings, 450_000);
  assert.equal(after.expenseCop, 0);
});

test('debt payment counts all cash paid but only interest and fees as expense', () => {
  const result = calculateFinancialSummary(accounts, [transactions[3]], 0);
  assert.equal(result.accountBalancesCop.checking, 395_000);
  assert.equal(result.expenseCop, 5_000);
});

test('debt balance falls only by posted principal, not interest, fees, or planned payments', () => {
  const debt: Debt = { id: 'loan', name: 'Préstamo', openingPrincipalCop: 300_000 };
  assert.equal(calculateDebtBalance(debt, transactions), 200_000);
});

test('rejects fractional pesos and transfers within the same account', () => {
  assert.throws(() => calculateFinancialSummary(accounts, [{ ...transactions[0], amountCop: 1.5 }], 0), /safe integer/);
  assert.throws(() => calculateFinancialSummary(accounts, [{ ...transactions[2], fromAccountId: 'checking', toAccountId: 'checking' }], 0), /different accounts/);
});

test('rejects debt principal payments above the recorded principal', () => {
  const debt: Debt = { id: 'loan', name: 'Préstamo', openingPrincipalCop: 100_000 };
  const overpayment: Transaction = { id: 'overpayment', date: '2026-10-05', status: 'posted', kind: 'debt_payment', accountId: 'checking', debtId: 'loan', principalCop: 101_000, interestCop: 0, feeCop: 0 };
  assert.throws(() => calculateDebtBalance(debt, [overpayment]), /exceeds the opening balance/);
});

test('formats COP using whole pesos and Colombian separators', () => {
  assert.match(formatCop(1_234_567), /1\.234\.567/);
  assert.doesNotMatch(formatCop(1_234_567), /,\d{2}/);
});
