import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPasswordConfirm } from '../api/auth';
import '../styles/Auth.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const token = new URLSearchParams(location.search).get('token');

    const handleReset = async () => {
        if (!token) {
            setError('Missing reset token');
            return;
        }

        if (!newPassword) {
            setError('Enter new password');
            return;
        }

        try {
            const data = await resetPasswordConfirm(token, newPassword);
            setSuccess(data.message);
            setError('');

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                'Reset failed';
            setError(msg);
            setSuccess('');
        }
    };

    return (
        <div className="auth-container">
            <h2>Reset Password</h2>
            <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => {
                    setNewPassword(e.target.value);
                    setError('');
                }}
            />
            <button onClick={handleReset}>RESET</button>
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {error && <p className="auth-error">{error}</p>}
        </div>
    );
};

export default ResetPassword;
