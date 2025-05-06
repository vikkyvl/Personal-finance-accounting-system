import { api } from './axios';

export const loginUserWithResponse = async (email: string, password: string) => {
    const res = await api.post('/users/login', { email, password });
    return res.data;
};

export const resetPasswordConfirm = async (token: string, newPassword: string) => {
    const res = await api.post('/users/reset-confirm', {
        token,
        newPassword,
    });
    return res.data;
};

export const registerUser = async (username: string, email: string, password: string) => {
    const res = await api.post('/users/register', { username, email, password });
    return res.data;
};

export const requestPasswordReset = async (email: string) => {
    const res = await api.post('/users/reset-request', { email });
    return res.data;
};