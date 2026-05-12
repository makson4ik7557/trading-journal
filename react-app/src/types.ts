export type Role = 'user' | 'admin';

export interface User {
    id: number;
    email: string;
    name: string;
    role: Role;
    created_at?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Asset {
    id: number;
    symbol: string;
    name: string;
    market: 'crypto' | 'stock' | 'forex' | 'commodity';
    created_at: string;
}

export interface Trade {
    id: number;
    user_id: number;
    asset_id: number;
    asset_symbol: string;
    asset_name: string;
    asset_market: string;
    side: 'buy' | 'sell';
    entry_price: number;
    exit_price: number | null;
    quantity: number;
    entry_date: string;
    exit_date: string | null;
    notes: string | null;
    pnl: number | null;
    pnl_percent: number | null;
    status: 'open' | 'closed';
    result: 'win' | 'loss' | 'breakeven' | null;
}

export interface Stats {
    total_trades: number;
    open_trades: number;
    closed_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    total_pnl: number;
    avg_win: number;
    avg_loss: number;
    profit_factor: number | null;
    best_trade: { id: number; symbol: string; pnl: number } | null;
    worst_trade: { id: number; symbol: string; pnl: number } | null;
    by_asset: Array<{ symbol: string; trades: number; pnl: number; win_rate: number }>;
}