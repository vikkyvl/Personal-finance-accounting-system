import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { loginUserWithResponse } from '../api/auth';
import '../styles/Auth.css';
import Logo from '../icons/Logo.svg';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            const { accessToken, userId } = await loginUserWithResponse(email, password);

            if (!accessToken || !userId) {
                setError('No accessToken or userId received');
                return;
            }

            login(accessToken);
            localStorage.setItem('email', email);
            localStorage.setItem('userId', userId);

            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);

            if (err.response?.status === 404) {
                setError("User not found. Would you like to register?");
            } else {
                const message =
                    err.response?.data?.message ||
                    (err.code === 'ERR_NETWORK'
                        ? 'Network Error — check API connection'
                        : 'Login failed');
                setError(message);
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
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
            <button onClick={handleLogin}>LOGIN</button>
            {error && <p className="error">{error}</p>}
            <p className="toggle-auth">
                Don’t have an account? <Link to="/register">Register</Link>
            </p>
            <p className="toggle-auth">
                Forgot your password?
                <Link to="/forgot-password"> Reset it</Link>
            </p>
        </div>
    );
};

export default Login;






