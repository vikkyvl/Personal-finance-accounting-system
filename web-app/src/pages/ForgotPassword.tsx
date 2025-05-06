import { useState } from 'react';
import { api } from '../api/axios';
import '../styles/Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetRequest = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }

        try {
            const res = await api.post('/users/reset-request', { email });
            setMessage(res.data.message);
            setError('');
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                (err.code === 'ERR_NETWORK' ? 'Network Error' : 'Reset failed');
            setError(msg);
            setMessage('');
        }
    };

    return (
        <div className="auth-container">
            <h2>Reset Password</h2>
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => {
                    setEmail(e.target.value);
                    setError('');
                }}
            />
            <button onClick={handleResetRequest}>SEND RESET LINK</button>
            {message && <p>{message}</p>}
            {error && <p className="auth-error">{error}</p>}
        </div>
    );
};

export default ForgotPassword;

