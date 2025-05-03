import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar-nav">
            <h3 className="sidebar-title">Finance App</h3>
            <nav>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
                <NavLink to="/transactions" className={({ isActive }) => isActive ? 'active' : ''}>Transactions</NavLink>
                <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}>Goals</NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;