import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import '../styles/Auth.css';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!username || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            setError('Email must contain @');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            await registerUser(username, email, password);
            navigate('/login');
        } catch (err: any) {
            console.error('Register error:', err);

            const message =
                err.response?.data?.message ||
                (err.code === 'ERR_NETWORK'
                    ? 'Network Error — check API'
                    : 'Internal server error');

            if (message.toLowerCase().includes('already')) {
                setError('User with this email already exists');
            } else {
                setError(message);
            }
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

            <div className="password-wrapper">
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={e => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                />
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
            </div>

            <button onClick={handleRegister}>REGISTER</button>
            {error && <p className="auth-error">{error}</p>}

            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Register;



