import { describe, it, expect } from 'vitest'
import {
    formatUSD,
    formatUSDCompact,
    formatUSDSigned,
    formatPercent,
    formatNumber,
} from '../format'

describe('formatUSD', () => {
    it('форматує позитивне число з двома знаками після крапки', () => {
        expect(formatUSD(1234.56)).toBe('$1,234.56')
    })

    it('форматує велике число з роздільниками тисяч', () => {
        expect(formatUSD(204432.66)).toBe('$204,432.66')
    })

    it('форматує негативне число', () => {
        expect(formatUSD(-227750)).toBe('-$227,750.00')
    })

    it('форматує нуль', () => {
        expect(formatUSD(0)).toBe('$0.00')
    })

    it('повертає тире для null', () => {
        expect(formatUSD(null)).toBe('—')
    })

    it('повертає тире для undefined', () => {
        expect(formatUSD(undefined)).toBe('—')
    })

    it('округлює до 2 знаків після крапки', () => {
        expect(formatUSD(1234.5678)).toBe('$1,234.57')
    })
})

describe('formatUSDCompact', () => {
    it('форматує без знаків після крапки', () => {
        expect(formatUSDCompact(400000)).toBe('$400,000')
    })

    it('округлює до цілого', () => {
        expect(formatUSDCompact(1234.99)).toBe('$1,235')
    })

    it('повертає тире для null', () => {
        expect(formatUSDCompact(null)).toBe('—')
    })

    it('повертає тире для undefined', () => {
        expect(formatUSDCompact(undefined)).toBe('—')
    })
})

describe('formatUSDSigned', () => {
    it('додає + до позитивного числа', () => {
        expect(formatUSDSigned(400000)).toBe('+$400,000')
    })

    it('додає - до негативного числа', () => {
        expect(formatUSDSigned(-227750)).toBe('-$227,750')
    })

    it('не додає знак до нуля', () => {
        expect(formatUSDSigned(0)).toBe('$0')
    })

    it('повертає тире для null', () => {
        expect(formatUSDSigned(null)).toBe('—')
    })

    it('повертає тире для undefined', () => {
        expect(formatUSDSigned(undefined)).toBe('—')
    })
})

describe('formatPercent', () => {
    it('форматує 75 як 75.0%', () => {
        expect(formatPercent(75)).toBe('75.0%')
    })

    it('форматує 0', () => {
        expect(formatPercent(0)).toBe('0.0%')
    })

    it('форматує 100', () => {
        expect(formatPercent(100)).toBe('100.0%')
    })

    it('округлює до одного знака', () => {
        expect(formatPercent(75.67)).toBe('75.7%')
    })

    it('повертає тире для null', () => {
        expect(formatPercent(null)).toBe('—')
    })

    it('повертає тире для undefined', () => {
        expect(formatPercent(undefined)).toBe('—')
    })
})

describe('formatNumber', () => {
    it('форматує з 2 знаками за замовчуванням', () => {
        expect(formatNumber(2.0746)).toBe('2.07')
    })

    it('підтримує кастомну кількість знаків', () => {
        expect(formatNumber(2.0746, 3)).toBe('2.075')
    })

    it('форматує цілі числа', () => {
        expect(formatNumber(5)).toBe('5.00')
    })

    it('форматує нуль', () => {
        expect(formatNumber(0)).toBe('0.00')
    })

    it('повертає тире для null', () => {
        expect(formatNumber(null)).toBe('—')
    })

    it('повертає тире для undefined', () => {
        expect(formatNumber(undefined)).toBe('—')
    })
})