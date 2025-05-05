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
    const [targetAmount, setTargetAmount] = useState<string>('');
    const [deadline, setDeadline] = useState('');
    const [progressInputs, setProgressInputs] = useState<Record<string, number>>({});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        in_progress: true,
        completed: false,
        failed: false,
    });
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [editGoalName, setEditGoalName] = useState('');
    const [editTargetAmount, setEditTargetAmount] = useState('');
    const [editDeadline, setEditDeadline] = useState('');

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await api.get(`/goals/${userId}`);
    
            const updatedGoals = res.data.map((goal: Goal) => {
                const deadlineDate = new Date(goal.deadline);
                const today = new Date();
    
                const currentAmount = Number(goal.current_amount);
                const targetAmount = Number(goal.target_amount);
    
                if (currentAmount >= targetAmount) {
                    return { ...goal, status: 'completed' };
                }
    
                if (deadlineDate < today && currentAmount < targetAmount) {
                    return { ...goal, status: 'failed' };
                }
    
                return goal;
            });
    
            setGoals(updatedGoals);
        } catch (err) {
            console.error('Error fetching goals:', err);
        }
    };

    const createGoal = async () => {
        const amount = Number(targetAmount);
    
        if (!goalName.trim() || amount <= 0 || !deadline) {
            alert('Please fill in all fields correctly!');
            return;
        }
    
        try {
            await api.post('/goals', {
                user_id: userId,
                goal_name: goalName,
                target_amount: amount,
                deadline,
            });
            setGoalName('');
            setTargetAmount('0');
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

    const startEditingGoal = (goal: Goal) => {
        setEditingGoal(goal);
        setEditGoalName(goal.goal_name);
        setEditTargetAmount(String(goal.target_amount));
        setEditDeadline(goal.deadline.split('T')[0]); 
    };

    const saveEditedGoal = async () => {
        if (!editingGoal) return;
    
        const updatedGoal = {
            goal_name: editGoalName,
            target_amount: Number(editTargetAmount),
            deadline: editDeadline,
        };
    
        try {
            await api.put(`/goals/${editingGoal.id}`, updatedGoal);
            setEditingGoal(null);
            fetchGoals();
        } catch (err) {
            console.error('Error updating goal:', err);
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
                        <div className="progress-bar-wrapper">
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%`,
                                }}
                            ></div>
                        </div>
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
                                <button
                                    className="goal-edit-btn"
                                    onClick={() => startEditingGoal(goal)}
                                >
                                    Edit Goal
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
                        onChange={e => setTargetAmount(e.target.value)}
                        onFocus={() => {
                            if (targetAmount === '0') {
                                setTargetAmount('');
                            }
                        }}
                        onBlur={() => {
                            if (targetAmount === '') {
                                setTargetAmount('0');
                            }
                        }}
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
            {editingGoal && (
                <div className="modal-backdrop">
                    <div className="edit-goal-form">
                        <h3>Edit Goal: {editingGoal.goal_name}</h3>
                        <input
                            type="text"
                            value={editGoalName}
                            onChange={e => setEditGoalName(e.target.value)}
                            placeholder="Goal name"
                        />
                        <input
                            type="number"
                            value={editTargetAmount}
                            onChange={e => setEditTargetAmount(e.target.value)}
                            placeholder="Target amount"
                        />
                        <input
                            type="date"
                            value={editDeadline}
                            onChange={e => setEditDeadline(e.target.value)}
                        />
                        <div className="edit-goal-buttons">
                            <button className="save-btn" onClick={saveEditedGoal}>
                                Save Changes
                            </button>
                            <button
                                className="cancel-btn"
                                onClick={() => setEditingGoal(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Goals;



