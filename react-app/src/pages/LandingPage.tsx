import { Link } from 'react-router-dom'

export default function LandingPage() {
    return (
        <div className="landing">

            <nav className="landing-nav">
                <div className="landing-nav__logo">⊜ Journal</div>
                <div className="landing-nav__actions">
                    <Link to="/login" className="btn btn--ghost">Log in</Link>
                    <Link to="/register" className="btn btn--primary">Get started</Link>
                </div>
            </nav>

            <section className="hero">
                <div className="hero__inner">
                    <div className="hero__badge">Your trading journal</div>
                    <h1 className="hero__title">
                        Trade smarter with <span>data on your side</span>
                    </h1>
                    <p className="hero__subtitle">
                        Log every trade, spot patterns, and turn losing streaks into learning.
                        The journal serious traders actually keep.
                    </p>
                    <div className="hero__cta">
                        <Link to="/register" className="btn btn--primary btn--lg">Get started free</Link>
                        <Link to="/dashboard" className="btn btn--secondary btn--lg">See the demo →</Link>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="features__grid">

                    <div className="feature">
                        <div className="feature__icon">📊</div>
                        <h3 className="feature__title">Track every trade</h3>
                        <p className="feature__text">
                            Log entry, exit, size, and notes for every position. Build the dataset
                            that turns gut-feel into evidence.
                        </p>
                    </div>

                    <div className="feature">
                        <div className="feature__icon">📈</div>
                        <h3 className="feature__title">See your real numbers</h3>
                        <p className="feature__text">
                            Win rate, P&amp;L, profit factor, drawdown — calculated from your actual
                            trades. No more wondering how you&apos;re really doing.
                        </p>
                    </div>

                    <div className="feature">
                        <div className="feature__icon">🎯</div>
                        <h3 className="feature__title">Spot what works</h3>
                        <p className="feature__text">
                            Break down performance by asset, side, and time period. Find the
                            setups that pay and the ones that don&apos;t.
                        </p>
                    </div>

                </div>
            </section>

            <footer className="landing-footer">
                © 2026 Trading Journal · Built for traders who care about getting better.
            </footer>

        </div>
    )
}