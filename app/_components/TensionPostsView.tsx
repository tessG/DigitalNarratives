'use client'

import { useState } from 'react'
import type { TensionPost } from '../types'
import { cell, cellHeader } from './cellStyles'

function formatFullDate(date: string) {
    const [year, month, day] = date.split('-')
    return `${day}/${month}/${year}`
}

export function TensionPostsView({ data }: { data: TensionPost[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <div style={{ ...cell, padding: '1rem 1.25rem' }}>
            <div style={cellHeader}>Tension posts</div>
            {data.map((post, i) => {
                const isOpen = openIndex === i
                return (
                    <div
                        key={i}
                        style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' }}
                    >
                        <div
                            onClick={() => setOpenIndex(isOpen ? null : i)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 12px', cursor: 'pointer', gap: '8px' }}
                        >
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                                    {post.platform} · {formatFullDate(post.date)}
                                </div>
                                <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
                                    {isOpen ? post.content : `${post.content.slice(0, 120)}${post.content.length > 120 ? '…' : ''}`}
                                </div>
                            </div>
                            <span style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', flexShrink: 0, marginTop: '2px' }}>
                                {isOpen ? '▲' : '▼'}
                            </span>
                        </div>
                        {isOpen && (
                            <div style={{ padding: '0 12px 10px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '8px', background: 'var(--color-badge-bg)', color: 'var(--color-badge-text)' }}>
                                    contradictory
                                </span>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
