import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import Topbar from '../components/Topbar';
import '../styles/Goals.css';

interface Goal {
    id: string;
    user_id: string;
    goal_name: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
    status: 'in_progress' | 'completed' | 'failed';
}

const Goals = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState<number>(0);
    const [deadline, setDeadline] = useState('');
    const [progressInputs, setProgressInputs] = useState<Record<string, number>>({});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        in_progress: true,
        completed: false,
        failed: false,
    });

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await api.get(`/goals/${userId}`);
            setGoals(res.data);
        } catch (err) {
            console.error('Error fetching goals:', err);
        }
    };

    const createGoal = async () => {
        if (!goalName.trim() || targetAmount <= 0 || !deadline) {
            alert('Please fill in all fields correctly!');
            return;
        }

        try {
            await api.post('/goals', {
                user_id: userId,
                goal_name: goalName,
                target_amount: targetAmount,
                deadline,
            });
            setGoalName('');
            setTargetAmount(0);
            setDeadline('');
            fetchGoals();
        } catch (err) {
            console.error('Error creating goal:', err);
        }
    };

    const fundGoal = async (goal: Goal, amount: number) => {
        if (amount <= 0) {
            alert('Amount must be greater than 0');
            return;
        }

        const remainingAmount = goal.target_amount - goal.current_amount;
        if (remainingAmount <= 0) {
            alert('This goal is already completed.');
            return;
        }

        const actualAmount = Math.min(amount, remainingAmount);

        try {
            await api.put(`/goals/${goal.id}`, {
                current_amount: Number(goal.current_amount) + actualAmount,
            });

            await api.post('/transactions', {
                user_id: userId,
                amount: actualAmount,
                type: 'expense',
                category: 'goal',
                description: `Funded goal: ${goal.goal_name}`,
                transaction_date: new Date().toISOString().split('T')[0],
            });

            if (amount > actualAmount) {
                alert(`Only $${actualAmount} was needed to complete the goal.`);
            }

            fetchGoals();
            setProgressInputs(prev => ({ ...prev, [goal.id]: 0 }));
        } catch (err) {
            console.error('Error funding goal:', err);
        }
    };

    const toggleSection = (status: string) => {
        setExpanded(prev => ({ ...prev, [status]: !prev[status] }));
    };

    const renderGoals = (status: Goal['status']) => (
        <>
            <h3 className="section-header" onClick={() => toggleSection(status)}>
                {expanded[status] ? '▼' : '▶'}{' '}
                {status === 'in_progress' ? 'Active Goals' : status === 'completed' ? 'Completed Goals' : 'Failed Goals'}
            </h3>
            {expanded[status] &&
                goals.filter(g => g.status === status).map(goal => (
                    <div className="goal-card" key={goal.id}>
                        <h4>{goal.goal_name}</h4>
                        <p>Progress: ${goal.current_amount} / ${goal.target_amount}</p>
                        <p>Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                        {goal.status === 'in_progress' && (
                            <div className="goal-progress-form">
                                <input
                                    type="number"
                                    placeholder="Add amount"
                                    value={progressInputs[goal.id] || ''}
                                    onChange={e =>
                                        setProgressInputs(prev => ({
                                            ...prev,
                                            [goal.id]: Number(e.target.value),
                                        }))
                                    }
                                />
                                <button
                                    className="goal-update-btn"
                                    onClick={() =>
                                        fundGoal(goal, progressInputs[goal.id] || 0)
                                    }
                                >
                                    Fund Goal
                                </button>
                            </div>
                        )}
                    </div>
                ))}
        </>
    );

    return (
        <div>
            <Topbar />
            <div className="goals-container">
                <h2>Financial Goals</h2>

                <div className="form-section">
                    <input
                        type="text"
                        placeholder="Goal name"
                        value={goalName}
                        onChange={e => setGoalName(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Target amount"
                        value={targetAmount}
                        onChange={e => setTargetAmount(Number(e.target.value))}
                    />
                    <input
                        type="date"
                        value={deadline}
                        onChange={e => setDeadline(e.target.value)}
                    />
                    <button className="goal-create-btn" onClick={createGoal}>
                        Create Goal
                    </button>
                </div>

                <div className="goals-section">
                    {renderGoals('in_progress')}
                    {renderGoals('completed')}
                    {renderGoals('failed')}
                </div>
            </div>
        </div>
    );
};

export default Goals;



