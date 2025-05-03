import { api } from './axios';

export const fetchGoals = (userId: string) =>
    api.get(`/goals/${userId}`);

export const createGoal = (goal: any) =>
    api.post('/goals', goal);

export const updateGoal = (id: string, update: any) =>
    api.put(`/goals/${id}`, update);
