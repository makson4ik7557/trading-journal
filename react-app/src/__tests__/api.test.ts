// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { TOKEN_KEY, USER_KEY } from '../api'

describe('api module', () => {
    it('експортує правильний ключ для токена', () => {
        expect(TOKEN_KEY).toBe('tj_token')
    })

    it('експортує правильний ключ для юзера', () => {
        expect(USER_KEY).toBe('tj_user')
    })

    it('зберігає токен у localStorage', () => {
        localStorage.setItem(TOKEN_KEY, 'fake-jwt-token')
        expect(localStorage.getItem(TOKEN_KEY)).toBe('fake-jwt-token')
    })

    it('зберігає юзера як JSON у localStorage', () => {
        const user = { id: 1, email: 'test@test.com', name: 'Test', role: 'user' }
        localStorage.setItem(USER_KEY, JSON.stringify(user))
        const stored = localStorage.getItem(USER_KEY)
        expect(stored).toBeTruthy()
        expect(JSON.parse(stored!)).toEqual(user)
    })

    it('видаляє токен з localStorage', () => {
        localStorage.setItem(TOKEN_KEY, 'token')
        localStorage.removeItem(TOKEN_KEY)
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    })

    it('повертає null коли токена немає', () => {
        vi.clearAllMocks()
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    })
})