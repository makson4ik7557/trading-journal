import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute, AdminRoute, PublicOnlyRoute } from './routes/guards';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UsersPage } from './pages/UsersPage';
import DashboardPage from './pages/DashboardPage';
import TradesPage from './pages/TradesPage';
import AssetsPage from './pages/AssetsPage';
import LandingPage from './pages/LandingPage'

export function App() {
    return (
        <AuthProvider>
            <BrowserRouter basename="/trading-journal/react">
                <Routes>
                    <Route path="/login" element={
                        <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
                    } />
                    <Route path="/register" element={
                        <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>
                    } />

                    <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/trades" element={<TradesPage />} />
                        <Route path="/assets" element={<AssetsPage />} />
                        <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
                    </Route>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}