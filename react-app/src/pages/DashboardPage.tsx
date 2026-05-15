import { useState, useEffect } from 'react'
import type { Stats, Trade } from '../types'
import { api } from '../api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatUSD, formatUSDCompact, formatUSDSigned, formatPercent, formatNumber } from '../utils/format'
import LiveTicker from '../components/LiveTicker'

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const [statsRes, tradesRes] = await Promise.all([
                    api.get<Stats>('/stats'),
                    api.get<Trade[]>('/trades')
                ])
                setStats(statsRes.data)
                setTrades(tradesRes.data)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <div style={{ padding: 48, textAlign: 'center' }}>Завантаження…</div>
    if (!stats) return <div style={{ padding: 48, textAlign: 'center' }}>Немає даних</div>

    const closedSorted = trades
        .filter(t => t.status === 'closed' && t.pnl !== null)
        .sort((a, b) => new Date(a.exit_date!).getTime() - new Date(b.exit_date!).getTime())

    const equityCurve: { date: string; equity: number }[] = []
    if (closedSorted.length > 0) {
        const startDate = closedSorted[0].entry_date.slice(0, 10)
        equityCurve.push({ date: startDate, equity: 0 })

        let running = 0
        for (const trade of closedSorted) {
            running += trade.pnl ?? 0
            equityCurve.push({ date: trade.exit_date!.slice(0, 10), equity: running })
        }
    }

    const pnlClass = (pnl: number | null | undefined) => {
        if (pnl === null || pnl === undefined || pnl === 0) return ''
        return pnl > 0 ? 'pnl pnl--profit' : 'pnl pnl--loss'
    }

    return (
        <div>
            <LiveTicker />

            <div className="page-header">
                <div>
                    <h1 className="page-header__title">Dashboard</h1>
                    <p className="page-header__subtitle">Performance overview</p>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-card__label">Total P&L</div>
                    <div className={`kpi-card__value ${pnlClass(stats.total_pnl)}`}>
                        {formatUSD(stats.total_pnl)}
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card__label">Win Rate</div>
                    <div className="kpi-card__value">{formatPercent(stats.win_rate)}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card__label">Profit Factor</div>
                    <div className="kpi-card__value">{formatNumber(stats.profit_factor)}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card__label">Best Trade</div>
                    <div className="kpi-card__value kpi-card__value--small">
                        {stats.best_trade
                            ? `${stats.best_trade.symbol} ${formatUSDSigned(stats.best_trade.pnl)}`
                            : '—'}
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card__label">Worst Trade</div>
                    <div className="kpi-card__value kpi-card__value--small">
                        {stats.worst_trade
                            ? `${stats.worst_trade.symbol} ${formatUSDSigned(stats.worst_trade.pnl)}`
                            : '—'}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 24 }}>
                <h2 style={{ marginBottom: 16, fontSize: 18 }}>Equity Curve</h2>
                {equityCurve.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 48, color: '#6B7280' }}>
                        No closed trades yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={equityCurve}>
                            <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                            <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                            <YAxis
                                stroke="#6B7280"
                                fontSize={12}
                                tickFormatter={(v) => formatUSDCompact(v)}
                            />
                            <Tooltip
                                contentStyle={{ background: '#0F172A', border: '1px solid #1F2937', borderRadius: 8 }}
                                labelStyle={{ color: '#9CA3AF' }}
                                formatter={(value) => [formatUSD(Number(value)), 'Equity']}
                            />
                            <Line type="monotone" dataKey="equity" stroke="#58E5C5" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div style={{ marginTop: 24 }}>
                <h2 style={{ marginBottom: 16, fontSize: 18 }}>Recent Trades</h2>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Side</th>
                            <th>P&L</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {trades.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24 }}>No trades yet</td></tr>
                        )}
                        {trades.slice(0, 10).map(trade => (
                            <tr key={trade.id}>
                                <td><strong>{trade.asset_symbol}</strong></td>
                                <td>
                                    <span className={`badge badge--${trade.side === 'buy' ? 'profit' : 'loss'}`}>
                                        {trade.side}
                                    </span>
                                </td>
                                <td className={pnlClass(trade.pnl)}>{formatUSD(trade.pnl)}</td>
                                <td>
                                    <span className={`badge badge--${trade.status === 'closed' ? 'closed' : 'open'}`}>
                                        {trade.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}