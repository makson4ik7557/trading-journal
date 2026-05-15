import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export interface PriceUpdate {
    symbol: string
    price: number
    change_percent: number
    at: string
}

export interface PriceData {
    [symbol: string]: {
        price: number
        change_percent: number
        updatedAt: number
    }
}

export function usePriceUpdates() {
    const [prices, setPrices] = useState<PriceData>({})
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        const socket: Socket = io('http://localhost:4000', {
            transports: ['websocket', 'polling'],
        })

        socket.on('connect', () => {
            console.log('[ws] connected')
            setConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('[ws] disconnected')
            setConnected(false)
        })

        socket.on('price:update', (update: PriceUpdate) => {
            setPrices((prev) => ({
                ...prev,
                [update.symbol]: {
                    price: update.price,
                    change_percent: update.change_percent,
                    updatedAt: Date.now(),
                },
            }))
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    return { prices, connected }
}