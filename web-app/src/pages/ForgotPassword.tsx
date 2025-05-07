import { useState } from 'react';
import { requestPasswordReset } from '../api/auth';
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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            const data = await requestPasswordReset(email);
            setMessage(data.message);
            setError('');
        } catch (err: any) {
            const status = err.response?.status;

            if (status === 404) {
                setError('User with this email does not exist');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Network Error');
            } else {
                setError('Reset failed. Please try again.');
            }

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

