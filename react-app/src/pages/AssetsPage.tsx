/*
завантажити assets з GET /api/assets
    ↓
показати таблицю
    ↓
натиснув Add → відкрити Modal з пустою формою → POST /api/assets
Edit → відкрити Modal з заповненою формою → PATCH /api/assets/:id
Delete → одразу DELETE /api/assets/:id

Add/Edit/Delete доступні тільки admin.
*/

import { useState, useEffect } from 'react'
import type { Asset } from '../types'
import { api } from '../api'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'

export default function AssetsPage() {
    const { isAdmin } = useAuth()

    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
    const [symbol, setSymbol] = useState('')
    const [name, setName] = useState('')
    const [market, setMarket] = useState('crypto')

    const resetForm = () => {
        setEditingAsset(null)
        setSymbol('')
        setName('')
        setMarket('crypto')
    }

    const openAddModal = () => {
        resetForm()
        setIsModalOpen(true)
    }

    const openEditModal = (asset: Asset) => {
        setEditingAsset(asset)
        setSymbol(asset.symbol)
        setName(asset.name)
        setMarket(asset.market)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        resetForm()
    }

    const loadAssets = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data } = await api.get<Asset[]>('/assets')
            setAssets(data)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load assets'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Видалити актив?')) return
        try {
            await api.delete(`/assets/${id}`)
            setAssets(assets.filter(a => a.id !== id))
        } catch {
            alert('Помилка видалення')
        }
    }

    const handleSave = async () => {
        try {
            if (editingAsset) {
                await api.patch(`/assets/${editingAsset.id}`, { symbol, name, market })
            } else {
                await api.post('/assets', { symbol, name, market })
            }
            closeModal()
            loadAssets()
        } catch {
            alert('Помилка збереження')
        }
    }

    useEffect(() => {
        loadAssets()
    }, [])

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-header__title">Assets</h1>
                    <p className="page-header__subtitle">Trading instruments</p>
                </div>
                {isAdmin && (
                    <button className="btn btn--primary" onClick={openAddModal}>
                        + Add Asset
                    </button>
                )}
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Name</th>
                        <th>Market</th>
                        {isAdmin && <th></th>}
                    </tr>
                    </thead>
                    <tbody>
                    {loading && (
                        <tr><td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', padding: 24 }}>Завантаження…</td></tr>
                    )}
                    {error && (
                        <tr><td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', padding: 24, color: '#F6465D' }}>{error}</td></tr>
                    )}
                    {!loading && !error && assets.length === 0 && (
                        <tr><td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', padding: 24 }}>No assets yet</td></tr>
                    )}
                    {assets.map(asset => (
                        <tr key={asset.id}>
                            <td><strong>{asset.symbol}</strong></td>
                            <td>{asset.name}</td>
                            <td><span className="badge badge--open">{asset.market}</span></td>
                            {isAdmin && (
                                <td>
                                    <div className="table__actions">
                                        <button className="btn btn--ghost btn--sm" onClick={() => openEditModal(asset)}>Edit</button>
                                        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(asset.id)}>Delete</button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingAsset ? 'Edit Asset' : 'Add Asset'}
            >
                <div className="auth-form__fields">
                    <div className="input-group">
                        <label className="input-group__label">Symbol</label>
                        <input className="input" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="BTC" />
                    </div>
                    <div className="input-group">
                        <label className="input-group__label">Name</label>
                        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Bitcoin" />
                    </div>
                    <div className="input-group">
                        <label className="input-group__label">Market</label>
                        <select className="input" value={market} onChange={e => setMarket(e.target.value)}>
                            <option value="crypto">Crypto</option>
                            <option value="stock">Stock</option>
                            <option value="forex">Forex</option>
                            <option value="commodity">Commodity</option>
                        </select>
                    </div>
                </div>
                <button className="btn btn--primary btn--block" onClick={handleSave} style={{ marginTop: 16 }}>
                    Save
                </button>
            </Modal>
        </div>
    )
}