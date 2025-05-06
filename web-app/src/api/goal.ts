import { api } from './axios';

export const fetchGoals = (userId: string, token?: string) => {
    return api.get(`/goals/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const createGoal = (goal: {
    user_id: string;
    goal_name: string;
    target_amount: number;
    deadline: string;
}, token?: string) => {
    return api.post('/goals', goal, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const updateGoal = (
    id: string,
    update: {
        goal_name?: string;
        target_amount?: number;
        deadline?: string;
        current_amount?: number;
    },
    token?: string
) => {
    return api.put(`/goals/${id}`, update, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

