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
import { ResponsiveContainer } from 'recharts';

const COLORS = ['#47CFEA', '#434C6B', '#5A422C', '#4E97A7', '#FA880D', '#D4BBA6', '#2B384C', '#0C8EF4'];

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
    const [latestExpenses, setLatestExpenses] = useState<any[]>([]);
    const [closestGoal, setClosestGoal] = useState<any>(null);

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

            const expenses = res.data
                .filter((tx: any) => tx.type === 'expense')
                .sort((a: any, b: any) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                .slice(0, 6)
                .map((tx: any) => ({
                    ...tx,
                    amount: Number(tx.amount),
                    category: tx.category.charAt(0).toUpperCase() + tx.category.slice(1).toLowerCase()
                }));
            
            setLatestExpenses(expenses);

            api.get(`/goals/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                const goals = res.data;
        
                const upcomingGoal = goals
                    .filter((goal: any) => new Date(goal.deadline) >= new Date()) 
                    .sort((a: any, b: any) =>
                        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                    )[0]; 
        
                if (upcomingGoal) {
                    setClosestGoal(upcomingGoal);
                }
            });
        });
    }, [userId, token]);

    return (
        <>
            <Topbar />
            <main className="main-content">
                <header className="header">
                    <div className="balance-card">
                        <p>Available Balance</p>
                        <h2 style={{ textAlign: 'left' }}>${summary.balance.toFixed(2)}</h2>
                    </div>
                    <div className="user-card">
                        <p><strong>{localStorage.getItem('email')}</strong></p>
                        <span>Logged in</span>
                    </div>
                </header>

                <section className="charts-section">
                    <div className="left-column">
                        {closestGoal && (
                            <div className="chart-box goal-progress-box">
                                <p style={{ 
                                    margin: '0', 
                                    fontSize: '1.25rem', 
                                    fontWeight: '700', 
                                    color: '#47cfea' 
                                }}>
                                    {Math.min(
                                        (Number(closestGoal.current_amount) / Number(closestGoal.target_amount)) * 100,
                                        100
                                    ).toFixed(0)}%
                                </p>
                                
                                <h4 style={{ margin: '0.3rem 0',  color: '#000'}}>{closestGoal.goal_name}</h4>
                                <p style={{ fontSize: '0.85rem', color: '#888'}}>Your current goal</p>
                                <p style={{ fontWeight: '600', fontSize: '1rem', color: '#47cfea' }}>
                                    ${closestGoal.current_amount.toLocaleString()}
                                    <span style={{ color: '#ccc' }}> / {closestGoal.target_amount.toLocaleString()}</span>
                                </p>

                                <div className="progress-bar-wrapper">
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${Math.min(
                                                (Number(closestGoal.current_amount) / Number(closestGoal.target_amount)) * 100,
                                                100
                                            ).toFixed(0)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="chart-box last-spendings-box">
                            <h4>Last Spendings</h4>
                            <div className="spendings-list">

                                {latestExpenses
                                    .filter(spending => spending.category === 'Salary')
                                    .map((spending, idx) => (
                                        <div className="spending-item" key={`salary-${idx}`}>
                                            <img src="/icons/Salary.svg" alt="Salary" className="spending-icon" />
                                            <div>
                                                <p className="spending-name">Salary</p>
                                                <p className="spending-amount">${Number(spending.amount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}

                                {latestExpenses
                                    .filter(spending => spending.category === 'Entertainment')
                                    .map((spending, idx) => (
                                        <div className="spending-item" key={`entertainment-${idx}`}>
                                            <img src="/icons/Entertainment.svg" alt="Entertainment" className="spending-icon" />
                                            <div>
                                                <p className="spending-name">Entertainment</p>
                                                <p className="spending-amount">${Number(spending.amount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}

                                {latestExpenses
                                    .filter(spending => spending.category === 'Groceries')
                                    .map((spending, idx) => (
                                        <div className="spending-item" key={`groceries-${idx}`}>
                                            <img src="/icons/Groceries.svg" alt="Groceries" className="spending-icon" />
                                            <div>
                                                <p className="spending-name">Groceries</p>
                                                <p className="spending-amount">${Number(spending.amount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}

                                {latestExpenses
                                    .filter(spending => spending.category === 'Health')
                                    .map((spending, idx) => (
                                        <div className="spending-item" key={`health-${idx}`}>
                                            <img src="/icons/Health.svg" alt="Health" className="spending-icon" />
                                            <div>
                                                <p className="spending-name">Health</p>
                                                <p className="spending-amount">${Number(spending.amount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}

                                {latestExpenses
                                    .filter(spending => spending.category === 'Utilities')
                                    .map((spending, idx) => (
                                        <div className="spending-item" key={`utilities-${idx}`}>
                                            <img src="/icons/Utilities.svg" alt="Utilities" className="spending-icon" />
                                            <div>
                                                <p className="spending-name">Utilities</p>
                                                <p className="spending-amount">${Number(spending.amount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}

                                {latestExpenses
                                    .filter(spending => spending.category === 'Transport')
                                    .map((spending, idx) => (
                                        <div className="spending-item" key={`transport-${idx}`}>
                                            <img src="/icons/Transport.svg" alt="Transport" className="spending-icon" />
                                            <div>
                                                <p className="spending-name">Transport</p>
                                                <p className="spending-amount">${Number(spending.amount).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}

                            </div>
                        </div>

                        <div className="chart-box bar-chart-box">
                            <h4>Income Source</h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={sources}>
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="amount" fill="#4E97A7" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="top-graphs">
                            <div className="pie-and-lines">
                                <div className="chart-box pie-chart-box">
                                    <h4>Spendings</h4>
                                    <PieChart width={350} height={392}>
                                        <Pie data={categories} dataKey="amount" nameKey="category" outerRadius={120} label>
                                            {categories.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>

                                    <div className="custom-legend">
                                        <div className="legend-column">
                                            {categories.slice(0, Math.ceil(categories.length / 2)).map((entry, index) => (
                                                <div key={`item-left-${index}`} className="legend-item">
                                                    <span
                                                        className="legend-color"
                                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                    ></span>
                                                    <span className="legend-text">{entry.category}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="legend-column">
                                            {categories.slice(Math.ceil(categories.length / 2)).map((entry, index) => {
                                                const colorIndex = index + Math.ceil(categories.length / 2);
                                                return (
                                                    <div key={`item-right-${index}`} className="legend-item">
                                                        <span
                                                            className="legend-color"
                                                            style={{ backgroundColor: COLORS[colorIndex % COLORS.length] }}
                                                        ></span>
                                                        <span className="legend-text">{entry.category}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="line-charts">
                                    <div className="chart-box line-chart-box">
                                        <h4>Income Over Time</h4>
                                        <LineChart width={450} height={200} data={timeseries}>
                                            <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                                            <Line type="monotone" dataKey="income" stroke="#00C49F" />
                                        </LineChart>
                                    </div>
                                    
                                    <div className="chart-box line-chart-box">
                                        <h4>Spendings Over Time</h4>
                                        <LineChart width={450} height={200} data={timeseries}>
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="expense" stroke="#FF8042" />
                                        </LineChart>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="chart-box wide">
                            <h4>Income & Expense Over Time</h4>
                            <LineChart width={800} height={250} data={timeseries}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                                <Line type="monotone" dataKey="income" stroke="#00C49F" />
                                <Line type="monotone" dataKey="expense" stroke="#FF8042" />
                            </LineChart>
                        </div>
                    </div>
                </section>
                
            </main>
        </>
    );
};

export default Dashboard;