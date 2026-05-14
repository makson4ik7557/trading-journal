import '@testing-library/jest-dom'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Простий in-memory localStorage який гарантовано працює.
// jsdom 29 має баг з localStorage.clear() — тому підставляємо свою реалізацію.
class MemoryStorage implements Storage {
    private store: Record<string, string> = {}

    get length(): number {
        return Object.keys(this.store).length
    }

    clear(): void {
        this.store = {}
    }

    getItem(key: string): string | null {
        return this.store[key] ?? null
    }

    key(index: number): string | null {
        return Object.keys(this.store)[index] ?? null
    }

    removeItem(key: string): void {
        delete this.store[key]
    }

    setItem(key: string, value: string): void {
        this.store[key] = String(value)
    }
}

Object.defineProperty(window, 'localStorage', {
    value: new MemoryStorage(),
    writable: false,
    configurable: true,
})

beforeEach(() => {
    window.localStorage.clear()
})

afterEach(() => {
    cleanup()
})