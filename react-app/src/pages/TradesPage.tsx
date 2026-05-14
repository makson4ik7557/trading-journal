import { useState, useEffect } from 'react'
import type { Trade, Asset } from '../types'
import { api } from '../api'
import Modal from '../components/Modal'
import { formatUSD } from '../utils/format'

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function TradesPage() {
    const [trades, setTrades] = useState<Trade[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null)

    const [filterAsset, setFilterAsset] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    const [assetId, setAssetId] = useState('')
    const [side, setSide] = useState<'buy' | 'sell'>('buy')
    const [entryPrice, setEntryPrice] = useState('')
    const [exitPrice, setExitPrice] = useState('')
    const [quantity, setQuantity] = useState('')
    const [entryDate, setEntryDate] = useState('')
    const [exitDate, setExitDate] = useState('')
    const [notes, setNotes] = useState('')

    const resetForm = () => {
        setEditingTrade(null)
        setAssetId('')
        setSide('buy')
        setEntryPrice('')
        setExitPrice('')
        setQuantity('')
        setEntryDate(todayISO())
        setExitDate('')
        setNotes('')
    }

    const openAddModal = () => {
        resetForm()
        setIsModalOpen(true)
    }

    const openEditModal = (trade: Trade) => {
        setEditingTrade(trade)
        setAssetId(String(trade.asset_id))
        setSide(trade.side)
        setEntryPrice(String(trade.entry_price))
        setExitPrice(trade.exit_price ? String(trade.exit_price) : '')
        setQuantity(String(trade.quantity))
        setEntryDate(trade.entry_date)
        setExitDate(trade.exit_date ?? '')
        setNotes(trade.notes ?? '')
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        resetForm()
    }

    const loadTrades = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data } = await api.get<Trade[]>('/trades')
            setTrades(data)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load trades'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const loadAssets = async () => {
        const { data } = await api.get<Asset[]>('/assets')
        setAssets(data)
    }

    useEffect(() => {
        loadTrades()
        loadAssets()
    }, [])

    const handleDelete = async (id: number) => {
        if (!confirm('Видалити трейд?')) return
        try {
            await api.delete(`/trades/${id}`)
            setTrades(trades.filter(t => t.id !== id))
        } catch {
            alert('Помилка видалення')
        }
    }

    const handleSave = async () => {
        try {
            const payload = {
                asset_id: Number(assetId),
                side,
                entry_price: Number(entryPrice),
                exit_price: exitPrice ? Number(exitPrice) : null,
                quantity: Number(quantity),
                entry_date: entryDate,
                exit_date: exitDate || null,
                notes: notes || null,
            }
            if (editingTrade) {
                await api.patch(`/trades/${editingTrade.id}`, payload)
            } else {
                await api.post('/trades', payload)
            }
            closeModal()
            loadTrades()
        } catch {
            alert('Помилка збереження')
        }
    }

    const filteredTrades = trades
        .filter(t => filterAsset ? t.asset_symbol === filterAsset : true)
        .filter(t => filterStatus ? t.status === filterStatus : true)

    const pnlClass = (pnl: number | null) => {
        if (pnl === null || pnl === 0) return ''
        return pnl > 0 ? 'pnl pnl--profit' : 'pnl pnl--loss'
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-header__title">Trades</h1>
                    <p className="page-header__subtitle">Your trade history</p>
                </div>
                <button className="btn btn--primary" onClick={openAddModal}>
                    + Add Trade
                </button>
            </div>

            <div className="filters">
                <select className="input" value={filterAsset} onChange={e => setFilterAsset(e.target.value)}>
                    <option value="">All Assets</option>
                    {assets.map(a => <option key={a.id} value={a.symbol}>{a.symbol}</option>)}
                </select>
                <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Side</th>
                        <th>Entry</th>
                        <th>Exit</th>
                        <th>Qty</th>
                        <th>P&L</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>Завантаження…</td></tr>
                    )}
                    {error && (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#F6465D' }}>{error}</td></tr>
                    )}
                    {!loading && !error && filteredTrades.length === 0 && (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>No trades yet — add your first trade!</td></tr>
                    )}
                    {filteredTrades.map(trade => (
                        <tr key={trade.id}>
                            <td><strong>{trade.asset_symbol}</strong></td>
                            <td>
                                <span className={`badge badge--${trade.side === 'buy' ? 'profit' : 'loss'}`}>
                                    {trade.side}
                                </span>
                            </td>
                            <td>{formatUSD(trade.entry_price)}</td>
                            <td>{trade.exit_price !== null ? formatUSD(trade.exit_price) : '—'}</td>
                            <td>{trade.quantity}</td>
                            <td className={pnlClass(trade.pnl)}>{formatUSD(trade.pnl)}</td>
                            <td>
                                <span className={`badge badge--${trade.status === 'closed' ? 'closed' : 'open'}`}>
                                    {trade.status}
                                </span>
                            </td>
                            <td>
                                <div className="table__actions">
                                    <button className="btn btn--ghost btn--sm" onClick={() => openEditModal(trade)}>Edit</button>
                                    <button className="btn btn--danger btn--sm" onClick={() => handleDelete(trade.id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingTrade ? 'Edit Trade' : 'Add Trade'}
            >
                <div className="auth-form__fields">
                    <div className="input-group">
                        <label className="input-group__label">Asset</label>
                        <select className="input" value={assetId} onChange={e => setAssetId(e.target.value)}>
                            <option value="">Select asset</option>
                            {assets.map(a => <option key={a.id} value={a.id}>{a.symbol} — {a.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="input-group__label">Side</label>
                        <select className="input" value={side} onChange={e => setSide(e.target.value as 'buy' | 'sell')}>
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label className="input-group__label">Entry Price (USD)</label>
                        <input className="input" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="0.00" type="number" />
                    </div>
                    <div className="input-group">
                        <label className="input-group__label">Exit Price (USD, optional)</label>
                        <input className="input" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="0.00" type="number" />
                    </div>
                    <div className="input-group">
                        <label className="input-group__label">Quantity</label>
                        <input className="input" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" type="number" />
                    </div>
                    <div className="input-group">
                        <label className="input-group__label">Entry Date</label>
                        <input className="input" value={entryDate} onChange={e => setEntryDate(e.target.value)} type="date" />
                    </div>
                    <div className="input-group">
                        <label className="input-group__label">Exit Date (optional)</label>
                        <input className="input" value={exitDate} onChange={e => setExitDate(e.target.value)} type="date" />
                    </div>
                    <div className="input-group">
                        <label className="input-group__label">Notes</label>
                        <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Strategy, reasoning, lessons..." />
                    </div>
                </div>
                <button className="btn btn--primary btn--block" onClick={handleSave} style={{ marginTop: 16 }}>
                    Save
                </button>
            </Modal>
        </div>
    )
}