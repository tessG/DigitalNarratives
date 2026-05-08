import type { CSSProperties } from 'react'

export const cell: CSSProperties = {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: '12px',
}

export const cellHeader: CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
}
