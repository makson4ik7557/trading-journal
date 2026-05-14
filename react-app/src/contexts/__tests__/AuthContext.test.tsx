// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { api, TOKEN_KEY, USER_KEY } from '../../api'

vi.mock('../../api', async () => {
    const actual = await vi.importActual<typeof import('../../api')>('../../api')
    return {
        ...actual,
        api: {
            post: vi.fn(),
        },
    }
})

const mockedApi = api as unknown as { post: ReturnType<typeof vi.fn> }

function TestComponent() {
    const { user, isAdmin, login, register, logout, loading } = useAuth()
    return (
        <div>
            <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
            <div data-testid="user">{user ? user.email : 'no-user'}</div>
            <div data-testid="is-admin">{isAdmin ? 'admin' : 'not-admin'}</div>
            <button onClick={() => login('test@test.com', 'password')}>login</button>
            <button onClick={() => register('Test', 'test@test.com', 'password')}>register</button>
            <button onClick={() => logout()}>logout</button>
        </div>
    )
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('початково користувач не залогінений', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('ready')
        })
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
        expect(screen.getByTestId('is-admin')).toHaveTextContent('not-admin')
    })

    it('відновлює юзера з localStorage при монтуванні', async () => {
        const user = { id: 1, email: 'saved@test.com', name: 'Saved', role: 'admin' }
        localStorage.setItem(TOKEN_KEY, 'fake-token')
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('saved@test.com')
        })
        expect(screen.getByTestId('is-admin')).toHaveTextContent('admin')
    })

    it('ігнорує невалідний JSON у localStorage', async () => {
        localStorage.setItem(TOKEN_KEY, 'token')
        localStorage.setItem(USER_KEY, 'not-valid-json{{{')

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('ready')
        })
        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    })

    it('login успішно зберігає юзера і токен', async () => {
        const responseUser = { id: 2, email: 'test@test.com', name: 'Test', role: 'user' }
        mockedApi.post.mockResolvedValueOnce({
            data: { user: responseUser, token: 'new-jwt-token' },
        })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('ready')
        })

        await act(async () => {
            screen.getByText('login').click()
        })

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('test@test.com')
        })
        expect(localStorage.getItem(TOKEN_KEY)).toBe('new-jwt-token')
        expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
            email: 'test@test.com',
            password: 'password',
        })
    })

    it('register успішно зберігає юзера і токен', async () => {
        const responseUser = { id: 3, email: 'test@test.com', name: 'Test', role: 'user' }
        mockedApi.post.mockResolvedValueOnce({
            data: { user: responseUser, token: 'reg-token' },
        })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('ready')
        })

        await act(async () => {
            screen.getByText('register').click()
        })

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('test@test.com')
        })
        expect(localStorage.getItem(TOKEN_KEY)).toBe('reg-token')
        expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', {
            name: 'Test',
            email: 'test@test.com',
            password: 'password',
        })
    })

    it('logout очищує юзера і токен', async () => {
        const user = { id: 1, email: 'test@test.com', name: 'Test', role: 'user' }
        localStorage.setItem(TOKEN_KEY, 'token')
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('user')).toHaveTextContent('test@test.com')
        })

        await act(async () => {
            screen.getByText('logout').click()
        })

        expect(screen.getByTestId('user')).toHaveTextContent('no-user')
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
        expect(localStorage.getItem(USER_KEY)).toBeNull()
    })

    it('isAdmin = true для ролі admin', async () => {
        const adminUser = { id: 1, email: 'admin@test.com', name: 'Admin', role: 'admin' }
        localStorage.setItem(TOKEN_KEY, 'token')
        localStorage.setItem(USER_KEY, JSON.stringify(adminUser))

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('is-admin')).toHaveTextContent('admin')
        })
    })

    it('isAdmin = false для ролі user', async () => {
        const normalUser = { id: 2, email: 'user@test.com', name: 'User', role: 'user' }
        localStorage.setItem(TOKEN_KEY, 'token')
        localStorage.setItem(USER_KEY, JSON.stringify(normalUser))

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('is-admin')).toHaveTextContent('not-admin')
        })
    })

    it('useAuth кидає помилку поза AuthProvider', () => {
        const originalError = console.error
        console.error = vi.fn()

        expect(() => render(<TestComponent />)).toThrow('useAuth must be used inside AuthProvider')

        console.error = originalError
    })
})