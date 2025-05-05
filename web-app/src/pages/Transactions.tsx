import { useEffect, useState } from 'react';
import { fetchTransactions, createTransaction } from '../api/transaction';
import Topbar from '../components/Topbar';
import '../styles/Transactions.css';

interface Transaction {
    id: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
    transaction_date: string;
}

const Transactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({});
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const fetchData = async () => {
        if (!userId || !token) return;

        try {
            const res = await fetchTransactions(userId, filterType, filterCategory, token);
            setTransactions(res.data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch transactions');
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId, token, filterType, filterCategory]);

    const handleAddTransaction = async () => {
        if (!userId || !token || !newTransaction.amount || !newTransaction.type || !newTransaction.category || !newTransaction.transaction_date) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            await createTransaction({
                ...newTransaction,
                user_id: userId,
                amount: Number(newTransaction.amount),
            }, token);


            setNewTransaction({});
            setShowForm(false);
            setError('');
            fetchData();
        } catch (err) {
            console.error(err);
            setError('Failed to add transaction');
        }
    };

    return (
        <div className="transactions-wrapper">
            <Topbar />
            <main className="transactions-main">
                <div className="transactions-header">
                    <h2>Transactions</h2>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Transaction'}
                    </button>
                </div>

                {/* Filters */}
                <div className="filter-bar">
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Filter by category"
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                    />
                </div>

                {showForm && (
                    <div className="form-container">
                        <input
                            type="number"
                            placeholder="Amount"
                            value={newTransaction.amount || ''}
                            onChange={e => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                        />
                        <select
                            value={newTransaction.type || ''}
                            onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense' })}
                        >
                            <option value="">Select type</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <select
                            value={newTransaction.category || ''}
                            onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                        >
                            <option value="">Select category</option>
                            <option value="salary">Salary</option>
                            <option value="groceries">Groceries</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="utilities">Utilities</option>
                            <option value="transport">Transport</option>
                            <option value="health">Health</option>
                            <option value="other">Other</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Description"
                            value={newTransaction.description || ''}
                            onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                        />
                        <input
                            type="date"
                            value={newTransaction.transaction_date || ''}
                            onChange={e => setNewTransaction({ ...newTransaction, transaction_date: e.target.value })}
                        />
                        <button onClick={handleAddTransaction}>Submit</button>
                        {error && <p className="error">{error}</p>}
                    </div>
                )}

                <div className="table-container">
                    {transactions.length === 0 ? (
                        <p>No transactions found.</p>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Category</th>
                                <th>Description</th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                                    <td className={tx.type}>{tx.type}</td>
                                    <td>${Number(tx.amount).toFixed(2)}</td>
                                    <td>{tx.category}</td>
                                    <td>{tx.description || '-'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Transactions;






