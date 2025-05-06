import { api } from './axios';

export const fetchTransactions = (
    userId: string,
    type?: string,
    category?: string,
    token?: string
) => {
    return api.get(`/transactions/${userId}`, {
        params: { type, category },
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const fetchTransactionSummary = (userId: string, token: string) => {
    return api.get(`/transactions/${userId}/summary`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createTransaction = (
    tx: any,
    token?: string
) => {
    return api.post('/transactions', tx, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

