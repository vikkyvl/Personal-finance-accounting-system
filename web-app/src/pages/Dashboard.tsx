import '../styles/Dashboard.css';
import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import {
    PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
    BarChart, Bar
} from 'recharts';
import Topbar from '../components/Topbar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface Summary {
    income: number;
    expense: number;
    balance: number;
}

interface CategoryEntry {
    category: string;
    amount: number;
}

interface TimeSeriesEntry {
    date: string;
    income: number;
    expense: number;
}

const Dashboard = () => {
    const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0, balance: 0 });
    const [categories, setCategories] = useState<CategoryEntry[]>([]);
    const [timeseries, setTimeseries] = useState<TimeSeriesEntry[]>([]);
    const [sources, setSources] = useState<CategoryEntry[]>([]);

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId || !token) return;

        api.get(`/transactions/${userId}/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setSummary({
            income: Number(res.data.income),
            expense: Number(res.data.expense),
            balance: Number(res.data.income) - Number(res.data.expense)
        }));

        api.get(`/transactions/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const grouped: Record<string, number> = {};
            const timeline: Record<string, { income: number; expense: number }> = {};
            const sourceGroup: Record<string, number> = {};

            res.data.forEach((tx: {
                type: 'income' | 'expense';
                amount: number;
                category: string;
                transaction_date: string;
            }) => {
                const amount = Number(tx.amount) || 0;
                const date = new Date(tx.transaction_date).toISOString().split('T')[0];

                if (tx.type === 'expense') {
                    grouped[tx.category] = (grouped[tx.category] || 0) + amount;
                }

                if (!timeline[date]) timeline[date] = { income: 0, expense: 0 };
                timeline[date][tx.type] += amount;

                if (tx.type === 'income') {
                    sourceGroup[tx.category] = (sourceGroup[tx.category] || 0) + amount;
                }
            });

            setCategories(Object.entries(grouped).map(([category, amount]) => ({ category, amount })));
            setTimeseries(Object.entries(timeline).map(([date, val]) => ({ date, ...val })));
            setSources(Object.entries(sourceGroup).map(([category, amount]) => ({ category, amount })));
        });
    }, [userId, token]);

    return (
        <>
            <Topbar />
            <main className="main-content">
                <header className="header">
                    <div className="balance-card">
                        <p>Available Balance</p>
                        <h2>${summary.balance.toFixed(2)}</h2>
                    </div>
                    <div className="user-card">
                        <p><strong>{localStorage.getItem('email')}</strong></p>
                        <span>Logged in</span>
                    </div>
                </header>

                <section className="charts-section">
                    <div className="chart-box">
                        <h4>Spendings</h4>
                        <PieChart width={250} height={250}>
                            <Pie data={categories} dataKey="amount" nameKey="category" outerRadius={80} label>
                                {categories.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </div>

                    <div className="chart-box">
                        <h4>Income Over Time</h4>
                        <LineChart width={300} height={200} data={timeseries}>
                            <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                            <Line type="monotone" dataKey="income" stroke="#00C49F" />
                        </LineChart>
                    </div>

                    <div className="chart-box wide">
                        <h4>Income & Expense Over Time</h4>
                        <LineChart width={500} height={250} data={timeseries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                            <Line type="monotone" dataKey="income" stroke="#00C49F" />
                            <Line type="monotone" dataKey="expense" stroke="#FF8042" />
                        </LineChart>
                    </div>

                    <div className="chart-box">
                        <h4>Income Source</h4>
                        <BarChart width={400} height={250} data={sources}>
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill="#8884d8" />
                        </BarChart>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Dashboard;




