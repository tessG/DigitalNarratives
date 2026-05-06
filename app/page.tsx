'use client'

import { useEffect, useState } from 'react'

type TagFrequencyItem = {
    tag: string
    count: number
}

type CooccurrenceItem = {
    tagA: string
    tagB: string
    count: number
}

type TemporalItem = {
    date: string
    tag: string
    count: number
}

type TensionPost = {
    content: string
    date: string
    platform: string
}

const cell: React.CSSProperties = {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
}

const cellHeader: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
}

export default function Home() {
    const [tagFrequency, setTagFrequency] = useState<TagFrequencyItem[]>([])
    const [cooccurrence, setCooccurrence] = useState<CooccurrenceItem[]>([])
    const [temporalArc, setTemporalArc] = useState<TemporalItem[]>([])
    const [tensionPosts, setTensionPosts] = useState<TensionPost[]>([])
    const [selectedEvent, setSelectedEvent] = useState('BLM Denmark 2020')

    const events = [
        { label: 'BLM Denmark 2020', active: true },
        { label: 'Gaza 2024', active: false },
        { label: 'Ukraine 2022', active: false },
    ]

    useEffect(() => {
        fetch('/api/tag-frequency').then(r => r.json()).then(setTagFrequency)
        fetch('/api/cooccurrence').then(r => r.json()).then(setCooccurrence)
        fetch('/api/temporal-arc').then(r => r.json()).then(setTemporalArc)
        fetch('/api/tension-posts').then(r => r.json()).then(setTensionPosts)
    }, [])

    const maxCount = Math.max(...tagFrequency.map(i => i.count), 1)

    const dates = [...new Set(temporalArc.map(i => i.date))].sort()
    const maxTemporalCount = Math.max(...temporalArc.map(i => i.count), 1)

    const formatDate = (date: string) => {
        const [, month, day] = date.split('-')
        return `${day}/${month}`
    }
    const formatFullDate = (date: string) => {
        const [year, month, day] = date.split('-')
        return `${day}/${month}/${year}`
    }
    return (
        <main style={{ padding: '1.5rem', background: 'var(--color-background-tertiary)', minHeight: '100vh' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <span style={{ fontSize: '18px', fontWeight: 500 }}>Narrative fingerprint</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Event</span>
                    {events.map(e => (
                        <span
                            key={e.label}
                            onClick={() => e.active && setSelectedEvent(e.label)}
                            style={{
                                fontSize: '13px',
                                fontWeight: e.label === selectedEvent ? 500 : 400,
                                padding: '4px 12px',
                                borderRadius: '20px',
                                cursor: e.active ? 'pointer' : 'default',
                                background: e.label === selectedEvent ? '#CECBF6' : 'var(--color-background-secondary)',
                                color: e.label === selectedEvent ? '#3C3489' : 'var(--color-text-tertiary)',
                                border: '0.5px solid var(--color-border-tertiary)',
                            }}
                        >
              {e.label}
            </span>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                <div style={cell}>
                    <div style={cellHeader}>Tag frequency</div>
                    {tagFrequency.map(item => (
                        <div key={item.tag} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                            <span style={{ fontSize: '14px' }}>{item.tag}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ height: '6px', width: `${(item.count / maxCount) * 80}px`, background: '#CECBF6', borderRadius: '3px' }}></div>
                                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', minWidth: '16px', textAlign: 'right' }}>{item.count}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={cell}>
                    <div style={cellHeader}>Frame shift over time</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', paddingTop: '1rem' }}>
                        {dates.map(date => {
                            const individual = temporalArc.find(i => i.date === date && i.tag === 'Individual Cause')?.count ?? 0
                            const systemic = temporalArc.find(i => i.date === date && i.tag === 'Systemic Cause')?.count ?? 0
                            return (
                                <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%', gap: '2px' }}>
                                        {individual > 0 && <div style={{ height: `${(individual / maxTemporalCount) * 80}px`, background: '#CECBF6', borderRadius: '2px' }}></div>}
                                        {systemic > 0 && <div style={{ height: `${(systemic / maxTemporalCount) * 80}px`, background: '#9FE1CB', borderRadius: '2px' }}></div>}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>{formatDate(date)}</div>
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#CECBF6' }}></div><span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Individual cause</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#9FE1CB' }}></div><span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Systemic cause</span></div>
                    </div>
                </div>

                <div style={cell}>
                    <div style={cellHeader}>Co-occurrence</div>
                    {cooccurrence.slice(0, 6).map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: '#E1F5EE', color: '#0F6E56' }}>{item.tagA}</span>
                            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: '#FAECE7', color: '#993C1D' }}>{item.tagB}</span>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>{item.count}×</span>
                        </div>
                    ))}
                </div>

                <div style={cell}>
                    <div style={cellHeader}>Tension posts</div>
                    {tensionPosts.map((post, i) => (
                        <div key={i} style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>{post.platform} · {formatFullDate(post.date)}</div>
                            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{post.content.slice(0, 120)}...</div>
                            <div style={{ marginTop: '6px' }}>
                                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '8px', background: '#FAEEDA', color: '#854F0B' }}>contradictory</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    )
}