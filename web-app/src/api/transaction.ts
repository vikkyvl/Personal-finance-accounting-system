import { api } from './axios';

export const fetchTransactions = (userId: string, type?: string, category?: string) =>
    api.get(`/transactions/${userId}`, {
        params: { type, category },
    });

export const createTransaction = (tx: any) =>
    api.post('/transactions', tx);
