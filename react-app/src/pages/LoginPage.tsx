import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-page__form-side">
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-form__logo">⊜ Journal</div>
                    <h1 className="auth-form__title">Log in</h1>
                    <p className="auth-form__subtitle">Welcome back to your trading journal</p>

                    <div className="auth-form__fields">
                        <div className="input-group">
                            <label className="input-group__label">Email</label>
                            <input
                                className="input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-group__label">Password</label>
                            <input
                                className="input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                        {submitting ? 'Logging in...' : 'Log in'}
                    </button>

                    {error && <div style={{ color: '#F6465D', marginTop: 12, fontSize: 13 }}>{error}</div>}

                    <div className="auth-form__footer">
                        Don&apos;t have an account? <Link to="/register">Sign up</Link>
                    </div>
                </form>
            </div>

            <div className="auth-page__art-side">
                <div className="auth-page__art">
                    <h2 className="auth-page__art-title">Trade smarter, not harder</h2>
                    <p className="auth-page__art-text">
                        Log every trade. Spot patterns in your wins and losses.
                        Become the trader you want to be.
                    </p>
                    <div className="auth-page__art-quote">
                        &quot;What gets measured gets managed.&quot;
                    </div>
                </div>
            </div>
        </div>
    );
}