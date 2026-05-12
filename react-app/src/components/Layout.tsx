import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = (e: MouseEvent) => {
        e.preventDefault();
        logout();
        navigate('/login');
    };

    const initials = user?.name.slice(0, 2).toUpperCase() ?? '?';

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar__logo">⊜ Journal</div>

                <nav className="sidebar__nav">
                    <div className="sidebar__section-title">Trading</div>
                    <NavLink to="/dashboard" className={({ isActive }: { isActive: boolean }) =>
                        `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}>Dashboard</NavLink>
                    <NavLink to="/trades" className={({ isActive }: { isActive: boolean }) =>
                        `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}>My Trades</NavLink>
                    <NavLink to="/assets" className={({ isActive }: { isActive: boolean }) =>
                        `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}>Assets</NavLink>
                </nav>

                {isAdmin && (
                    <nav className="sidebar__nav">
                        <div className="sidebar__section-title">Admin</div>
                        <NavLink to="/users" className={({ isActive }: { isActive: boolean }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}>Users</NavLink>
                    </nav>
                )}

                <nav className="sidebar__nav" style={{ marginTop: 'auto' }}>
                    <a href="#" className="sidebar__link" onClick={handleLogout}>Logout</a>
                </nav>
            </aside>

            <header className="header">
                <div className="header__title">Trading Journal</div>
                <div className="header__actions">
                    <div className="header__user">
                        <div className="header__avatar">{initials}</div>
                        <span>{user?.name}</span>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}