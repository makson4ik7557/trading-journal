// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import { PrivateRoute, AdminRoute, PublicOnlyRoute } from '../guards'
import { TOKEN_KEY, USER_KEY } from '../../api'

vi.mock('../../api', async () => {
    const actual = await vi.importActual<typeof import('../../api')>('../../api')
    return {
        ...actual,
        api: { post: vi.fn() },
    }
})

function renderWithRouter(initialPath: string, ui: React.ReactNode) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <AuthProvider>
                <Routes>
                    {ui}
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>
    )
}

describe('PrivateRoute', () => {
    it('редіректить на /login якщо юзер не залогінений', async () => {
        renderWithRouter(
            '/protected',
            <Route
                path="/protected"
                element={<PrivateRoute><div>Secret Content</div></PrivateRoute>}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument()
        })
        expect(screen.queryByText('Secret Content')).not.toBeInTheDocument()
    })

    it('пускає залогіненого юзера до контенту', async () => {
        const user = { id: 1, email: 'test@test.com', name: 'Test', role: 'user' }
        localStorage.setItem(TOKEN_KEY, 'token')
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        renderWithRouter(
            '/protected',
            <Route
                path="/protected"
                element={<PrivateRoute><div>Secret Content</div></PrivateRoute>}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Secret Content')).toBeInTheDocument()
        })
    })
})

describe('AdminRoute', () => {
    it('редіректить на /login якщо юзер не залогінений', async () => {
        renderWithRouter(
            '/admin',
            <Route
                path="/admin"
                element={<AdminRoute><div>Admin Content</div></AdminRoute>}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument()
        })
    })

    it('редіректить на /dashboard якщо юзер не admin', async () => {
        const user = { id: 1, email: 'test@test.com', name: 'Test', role: 'user' }
        localStorage.setItem(TOKEN_KEY, 'token')
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        renderWithRouter(
            '/admin',
            <Route
                path="/admin"
                element={<AdminRoute><div>Admin Content</div></AdminRoute>}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
        })
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    })

    it('пускає admin до контенту', async () => {
        const admin = { id: 1, email: 'admin@test.com', name: 'Admin', role: 'admin' }
        localStorage.setItem(TOKEN_KEY, 'token')
        localStorage.setItem(USER_KEY, JSON.stringify(admin))

        renderWithRouter(
            '/admin',
            <Route
                path="/admin"
                element={<AdminRoute><div>Admin Content</div></AdminRoute>}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Admin Content')).toBeInTheDocument()
        })
    })
})

describe('PublicOnlyRoute', () => {
    it('пускає не-залогіненого юзера', async () => {
        renderWithRouter(
            '/login-page',
            <Route
                path="/login-page"
                element={<PublicOnlyRoute><div>Public Content</div></PublicOnlyRoute>}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Public Content')).toBeInTheDocument()
        })
    })

    it('редіректить залогіненого юзера на /dashboard', async () => {
        const user = { id: 1, email: 'test@test.com', name: 'Test', role: 'user' }
        localStorage.setItem(TOKEN_KEY, 'token')
        localStorage.setItem(USER_KEY, JSON.stringify(user))

        renderWithRouter(
            '/login-page',
            <Route
                path="/login-page"
                element={<PublicOnlyRoute><div>Public Content</div></PublicOnlyRoute>}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
        })
        expect(screen.queryByText('Public Content')).not.toBeInTheDocument()
    })
})