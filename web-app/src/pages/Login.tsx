import {JSX, useState} from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { loginUserWithResponse } from '../api/auth';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/Auth.css';
import Logo from '../icons/Logo.svg';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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

            const status = err.response?.status;

            if (status === 404) {
                setError('User with this email does not exist. Please register.');
            } else if (status === 401) {
                setError('Invalid password. Please try again.');
            } else if (status === 400) {
                setError('Incorrect email or password format.');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Network Error — check API connection');
            } else {
                setError('Login failed. Please try again later.');
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
            <div className="password-wrapper">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                />
                <span className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
            </div>
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






