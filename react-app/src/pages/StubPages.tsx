export function DashboardPage() {
    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-header__title">Dashboard</h1>
                    <p className="page-header__subtitle">Full stats coming in Lab 4</p>
                </div>
            </div>
            <div className="card">
                <p>Welcome! This page will show your KPIs, equity curve, and recent trades — fully implemented in Lab 4.</p>
            </div>
        </div>
    );
}

export function TradesPage() {
    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-header__title">My Trades</h1>
                    <p className="page-header__subtitle">Full CRUD coming in Lab 4</p>
                </div>
            </div>
            <div className="card">
                <p>Trade form, filters, edit/delete — implemented in Lab 4.</p>
            </div>
        </div>
    );
}

export function AssetsPage() {
    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-header__title">Assets</h1>
                    <p className="page-header__subtitle">Full CRUD coming in Lab 4</p>
                </div>
            </div>
            <div className="card">
                <p>Admin asset management — implemented in Lab 4.</p>
            </div>
        </div>
    );
}