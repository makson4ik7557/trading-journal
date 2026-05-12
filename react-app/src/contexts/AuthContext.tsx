import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api, TOKEN_KEY, USER_KEY } from '../api';
import type { User, AuthResponse } from '../types';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(USER_KEY);
        const token = localStorage.getItem(TOKEN_KEY);
        if (stored && token) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem(USER_KEY);
                localStorage.removeItem(TOKEN_KEY);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
    };

    const register = async (name: string, email: string, password: string) => {
        const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    };

    const value: AuthContextValue = {
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}