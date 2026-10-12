/** COP is stored in whole pesos as an integer. Never store fractional pesos. */
export type Cop = number;

export interface Account {
  id: string;
  name: string;
  openingBalanceCop: Cop;
}

export interface Category {
  id: string;
  name: string;
  kind: 'income' | 'expense';
  isSystem: boolean;
}

interface BaseTransaction {
  id: string;
  date: string;
  status: 'posted' | 'planned';
  note?: string;
}

export interface IncomeTransaction extends BaseTransaction {
  kind: 'income';
  accountId: string;
  categoryId: string;
  amountCop: Cop;
}

export interface ExpenseTransaction extends BaseTransaction {
  kind: 'expense';
  accountId: string;
  categoryId: string;
  amountCop: Cop;
}

export interface TransferTransaction extends BaseTransaction {
  kind: 'transfer';
  fromAccountId: string;
  toAccountId: string;
  amountCop: Cop;
}

export interface DebtPaymentTransaction extends BaseTransaction {
  /** One record for the full cash payment; do not add a second expense for its components. */
  kind: 'debt_payment';
  accountId: string;
  debtId: string;
  principalCop: Cop;
  interestCop: Cop;
  feeCop: Cop;
}

export type Transaction = IncomeTransaction | ExpenseTransaction | TransferTransaction | DebtPaymentTransaction;

export interface Debt {
  id: string;
  name: string;
  openingPrincipalCop: Cop;
}

export interface FinancialSummary {
  accountBalancesCop: Record<string, Cop>;
  realBalanceCop: Cop;
  availableBalanceCop: Cop;
  projectedBalanceCop: Cop;
  incomeCop: Cop;
  expenseCop: Cop;
}

export interface StoredTransaction {
  id: string;
  kind: 'income' | 'expense';
  accountId: string;
  categoryId: string;
  categoryName: string;
  categorySymbol: string;
  amountCop: Cop;
  date: string;
  description: string;
}
