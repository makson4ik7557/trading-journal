import { usePriceUpdates } from '../hooks/usePriceUpdates'
import { formatUSD } from '../utils/format'

const SYMBOLS = ['BTC', 'ETH', 'SOL']

export default function LiveTicker() {
    const { prices, connected } = usePriceUpdates()

    return (
        <div className="live-ticker">
            <div className="live-ticker__header">
                <span className={`live-ticker__dot ${connected ? 'live-ticker__dot--on' : ''}`} />
                <span className="live-ticker__label">{connected ? 'LIVE' : 'OFFLINE'}</span>
            </div>

            <div className="live-ticker__items">
                {SYMBOLS.map((symbol) => {
                    const data = prices[symbol]
                    const isPositive = data ? data.change_percent > 0 : false
                    const isNegative = data ? data.change_percent < 0 : false
                    const isFresh = data ? Date.now() - data.updatedAt < 2000 : false

                    return (
                        <div
                            key={symbol}
                            className={`ticker-item ${
                                isFresh
                                    ? isPositive
                                        ? 'ticker-item--flash-up'
                                        : isNegative
                                            ? 'ticker-item--flash-down'
                                            : ''
                                    : ''
                            }`}
                        >
                            <span className="ticker-item__symbol">{symbol}</span>
                            <span className="ticker-item__price">
                                {data ? formatUSD(data.price) : '—'}
                            </span>
                            <span
                                className={`ticker-item__change ${
                                    isPositive ? 'ticker-item__change--up' : ''
                                } ${isNegative ? 'ticker-item__change--down' : ''}`}
                            >
                                {data
                                    ? `${isPositive ? '▲' : isNegative ? '▼' : ''} ${
                                        data.change_percent > 0 ? '+' : ''
                                    }${data.change_percent.toFixed(2)}%`
                                    : '—'}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}