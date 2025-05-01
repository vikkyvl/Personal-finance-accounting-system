import { useState } from 'react';
import { api } from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const res = await api.post('/users/login', { email, password });
            localStorage.setItem('token', res.data.token);
            alert('Login successful!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            /><br/>
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            /><br/>
            <button onClick={handleLogin}>Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;
