export class TransactionEventDto {
    userId: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}
