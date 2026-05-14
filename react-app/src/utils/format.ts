// Хелпери форматування чисел і валют.
// Використовуються в Dashboard, Trades, Recent Trades.

const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const usdCompact = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
})

const percent = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
})

// $204,432.66 (always 2 decimals)
export const formatUSD = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '—'
    return usd.format(value)
}

// $400,000 (no decimals, для коротких підписів)
export const formatUSDCompact = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '—'
    return usdCompact.format(value)
}

// $400,000 з + знаком якщо плюс
export const formatUSDSigned = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '—'
    const formatted = usdCompact.format(Math.abs(value))
    if (value > 0) return `+${formatted}`
    if (value < 0) return `-${formatted}`
    return formatted
}

// 75.0% з вхідного числа 0.75
export const formatPercent = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '—'
    return percent.format(value / 100)
}

// 2.07 (просте число без валюти, для profit factor)
export const formatNumber = (value: number | null | undefined, decimals = 2): string => {
    if (value === null || value === undefined) return '—'
    return value.toFixed(decimals)
}