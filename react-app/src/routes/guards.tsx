import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

export function PrivateRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
    const { user, loading, isAdmin } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}