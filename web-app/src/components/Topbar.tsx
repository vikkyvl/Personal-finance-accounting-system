// components/Topbar.tsx
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Topbar.css';

const Topbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        navigate('/login');
    };

    return (
        <div className="topbar">
            <div className="topbar-title">Personal Finance System</div>
            <nav className="topbar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
                <NavLink to="/transactions" className={({ isActive }) => isActive ? 'active' : ''}>Transactions</NavLink>
                <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}>Goals</NavLink>
            </nav>
            <div className="topbar-user">
                <span>{localStorage.getItem('email')}</span>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default Topbar;



