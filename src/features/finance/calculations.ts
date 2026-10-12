import type { Account, Cop, Debt, FinancialSummary, Transaction } from '@/types/finance';

function assertSafeCop(value: number, label: string, allowZero = false): asserts value is Cop {
  if (!Number.isSafeInteger(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new RangeError(`${label} must be a ${allowZero ? 'non-negative' : 'positive'} safe integer amount in COP`);
  }
}

function addCop(left: Cop, right: Cop, label: string): Cop {
  const result = left + right;
  if (!Number.isSafeInteger(result)) throw new RangeError(`${label} exceeds the safe COP range`);
  return result;
}

function transactionTotalCop(transaction: Extract<Transaction, { kind: 'debt_payment' }>): Cop {
  return addCop(addCop(transaction.principalCop, transaction.interestCop, 'Debt payment'), transaction.feeCop, 'Debt payment');
}

/**
 * Calculates account and household cash balances.
 * Budgets do not reserve cash. Pass only explicit unpaid obligations or goal allocations as reservedCop.
 * Planned movements affect projected balance only, never real or available balance.
 */
export function calculateFinancialSummary(
  accounts: Account[],
  transactions: Transaction[],
  reservedCop: Cop = 0,
): FinancialSummary {
  assertSafeCop(reservedCop, 'Reserved amount', true);

  const accountBalancesCop: Record<string, Cop> = {};
  for (const account of accounts) {
    if (!account.id || accountBalancesCop[account.id] !== undefined) throw new Error(`Account id must be unique: ${account.id}`);
    assertSafeCop(account.openingBalanceCop, `Opening balance for ${account.id}`, true);
    accountBalancesCop[account.id] = account.openingBalanceCop;
  }

  let incomeCop = 0;
  let expenseCop = 0;
  let projectedDeltaCop = 0;

  const requireAccount = (accountId: string): void => {
    if (accountBalancesCop[accountId] === undefined) throw new Error(`Unknown account: ${accountId}`);
  };
  const changeAccount = (accountId: string, delta: Cop, transactionId: string): void => {
    requireAccount(accountId);
    accountBalancesCop[accountId] = addCop(accountBalancesCop[accountId], delta, `Balance for ${accountId} at ${transactionId}`);
  };

  for (const transaction of transactions) {
    const isPlanned = transaction.status === 'planned';
    if (transaction.kind === 'income') {
      assertSafeCop(transaction.amountCop, `Income ${transaction.id}`);
      requireAccount(transaction.accountId);
      if (isPlanned) projectedDeltaCop = addCop(projectedDeltaCop, transaction.amountCop, 'Projected balance');
      else {
        changeAccount(transaction.accountId, transaction.amountCop, transaction.id);
        incomeCop = addCop(incomeCop, transaction.amountCop, 'Income total');
      }
    } else if (transaction.kind === 'expense') {
      assertSafeCop(transaction.amountCop, `Expense ${transaction.id}`);
      requireAccount(transaction.accountId);
      if (isPlanned) projectedDeltaCop = addCop(projectedDeltaCop, -transaction.amountCop, 'Projected balance');
      else {
        changeAccount(transaction.accountId, -transaction.amountCop, transaction.id);
        expenseCop = addCop(expenseCop, transaction.amountCop, 'Expense total');
      }
    } else if (transaction.kind === 'transfer') {
      assertSafeCop(transaction.amountCop, `Transfer ${transaction.id}`);
      if (transaction.fromAccountId === transaction.toAccountId) throw new Error(`Transfer ${transaction.id} must use two different accounts`);
      requireAccount(transaction.fromAccountId);
      requireAccount(transaction.toAccountId);
      if (!isPlanned) {
        changeAccount(transaction.fromAccountId, -transaction.amountCop, transaction.id);
        changeAccount(transaction.toAccountId, transaction.amountCop, transaction.id);
      }
    } else {
      assertSafeCop(transaction.principalCop, `Principal for ${transaction.id}`, true);
      assertSafeCop(transaction.interestCop, `Interest for ${transaction.id}`, true);
      assertSafeCop(transaction.feeCop, `Fee for ${transaction.id}`, true);
      const totalCop = transactionTotalCop(transaction);
      assertSafeCop(totalCop, `Debt payment ${transaction.id}`);
      requireAccount(transaction.accountId);
      if (isPlanned) projectedDeltaCop = addCop(projectedDeltaCop, -totalCop, 'Projected balance');
      else {
        changeAccount(transaction.accountId, -totalCop, transaction.id);
        expenseCop = addCop(expenseCop, addCop(transaction.interestCop, transaction.feeCop, 'Debt payment costs'), 'Expense total');
      }
    }
  }

  let realBalanceCop = 0;
  for (const balance of Object.values(accountBalancesCop)) realBalanceCop = addCop(realBalanceCop, balance, 'Household balance');
  const availableBalanceCop = addCop(realBalanceCop, -reservedCop, 'Available balance');
  const projectedBalanceCop = addCop(realBalanceCop, projectedDeltaCop, 'Projected balance');

  return { accountBalancesCop, realBalanceCop, availableBalanceCop, projectedBalanceCop, incomeCop, expenseCop };
}

/** Debt balances are reduced by principal paid. Interest and fees are costs, not principal. */
export function calculateDebtBalance(debt: Debt, transactions: Transaction[]): Cop {
  assertSafeCop(debt.openingPrincipalCop, `Opening principal for ${debt.id}`, true);
  let principalPaidCop = 0;
  for (const transaction of transactions) {
    if (transaction.kind !== 'debt_payment' || transaction.debtId !== debt.id || transaction.status !== 'posted') continue;
    assertSafeCop(transaction.principalCop, `Principal for ${transaction.id}`, true);
    principalPaidCop = addCop(principalPaidCop, transaction.principalCop, 'Debt principal paid');
  }
  if (principalPaidCop > debt.openingPrincipalCop) throw new RangeError(`Principal paid exceeds the opening balance for ${debt.id}`);
  return addCop(debt.openingPrincipalCop, -principalPaidCop, 'Debt balance');
}
