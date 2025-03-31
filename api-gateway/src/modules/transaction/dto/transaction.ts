export class CreateTransactionDto {
    userId: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
    transactionDate: string; // ISO string
  }
  