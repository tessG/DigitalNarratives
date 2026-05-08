'use client'

import { useEffect, useState } from 'react'
import type { TagFrequencyItem, CooccurrenceItem, TemporalItem, TensionPost } from './types'
import { TagFrequencyView } from './_components/TagFrequencyView'
import { FrameShiftView } from './_components/FrameShiftView'
import { CooccurrenceView } from './_components/CooccurrenceView'
import { TensionPostsView } from './_components/TensionPostsView'

const events = [
    { label: 'BLM Denmark 2020', active: true },
    { label: 'Gaza 2024', active: false },
    { label: 'Ukraine 2022', active: false },
]

export default function Home() {
    const [tagFrequency, setTagFrequency] = useState<TagFrequencyItem[]>([])
    const [cooccurrence, setCooccurrence] = useState<CooccurrenceItem[]>([])
    const [temporalArc, setTemporalArc] = useState<TemporalItem[]>([])
    const [tensionPosts, setTensionPosts] = useState<TensionPost[]>([])
    const [selectedEvent, setSelectedEvent] = useState('BLM Denmark 2020')

    useEffect(() => {
        fetch('/api/tag-frequency').then(r => r.json()).then(setTagFrequency)
        fetch('/api/cooccurrence').then(r => r.json()).then(setCooccurrence)
        fetch('/api/temporal-arc').then(r => r.json()).then(setTemporalArc)
        fetch('/api/tension-posts').then(r => r.json()).then(setTensionPosts)
    }, [])

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
                <TagFrequencyView data={tagFrequency} />
                <FrameShiftView data={temporalArc} />
                <CooccurrenceView data={cooccurrence} />
                <TensionPostsView data={tensionPosts} />
            </div>
        </main>
    )
}
