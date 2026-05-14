import { createPortal } from 'react-dom'
import React from 'react'
//Modal — це div який рендериться поверх всього іншого контенту.
//Хто б не використовував Modal — він зобов'язаний передати ці 4 речі.
interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}
