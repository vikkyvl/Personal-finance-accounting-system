import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';
import '../styles/Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!username || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            await api.post('/users/register', { username, email, password });
            navigate('/login');
        } catch (err: any) {
            console.error('Register error:', err);
            const message =
                err.response?.data?.message ||
                (err.code === 'ERR_NETWORK' ? 'Network Error — check API' : 'Internal server error');
            setError(message);
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => {
                    setUsername(e.target.value);
                    setError('');
                }}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => {
                    setEmail(e.target.value);
                    setError('');
                }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                }}
            />
            <button onClick={handleRegister}>Register</button>
            {error && <p className="auth-error">{error}</p>}
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Register;


