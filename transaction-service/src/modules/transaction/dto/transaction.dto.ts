export interface TransactionDTO {
    user_id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
    transaction_date: Date;
  }
  