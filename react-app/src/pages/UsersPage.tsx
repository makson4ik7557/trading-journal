import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

export function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get<User[]>('/users');
            setUsers(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load users';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const toggleRole = async (user: User) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (!confirm(`Change role of ${user.name} to ${newRole}?`)) return;
        try {
            await api.patch(`/users/${user.id}`, { role: newRole });
            await loadUsers();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update user';
            alert(message);
        }
    };

    const deleteUser = async (user: User) => {
        if (!confirm(`Delete user ${user.name}? This cannot be undone.`)) return;
        try {
            await api.delete(`/users/${user.id}`);
            await loadUsers();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete user';
            alert(message);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-header__title">Users</h1>
                    <p className="page-header__subtitle">Manage accounts and roles</p>
                </div>
            </div>

            <div className="role-hint">
                <span className="role-hint__icon">👑</span>
                Admin only — promote users to admin or remove abandoned accounts.
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
                    {error && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#F6465D' }}>{error}</td></tr>}
                    {!loading && !error && users.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No users</td></tr>
                    )}
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td><strong>{u.name}</strong></td>
                            <td>{u.email}</td>
                            <td>
                  <span className={`badge badge--${u.role === 'admin' ? 'profit' : 'open'}`}>
                    {u.role}
                  </span>
                            </td>
                            <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                            <td>
                                <div className="table__actions">
                                    <button className="btn btn--ghost btn--sm" onClick={() => toggleRole(u)}>
                                        Make {u.role === 'admin' ? 'user' : 'admin'}
                                    </button>
                                    {u.id !== currentUser?.id && (
                                        <button className="btn btn--danger btn--sm" onClick={() => deleteUser(u)}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}