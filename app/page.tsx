'use client'

import { useEffect, useState } from 'react'
import type { TagFrequencyItem, CooccurrenceItem, TemporalItem, TensionPost } from './types'
import { TagFrequencyView } from './_components/TagFrequencyView'
import { FrameShiftView } from './_components/FrameShiftView'
import { CooccurrenceView } from './_components/CooccurrenceView'
import { TensionPostsView } from './_components/TensionPostsView'
import { SketchView } from './_components/SketchView'
import type { Sketch } from './_components/SketchView'

const colors = ['#FF88FA', '#33E08E', '#FD5061', '#FFEC4B']

const testSketch: Sketch = (p) => {
    const particles: { x: number; y: number; vx: number; vy: number; col: string }[] = []

    p.setup = () => {
        p.createCanvas(p.windowWidth, 260)
        p.colorMode(p.RGB)
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: p.random(p.width),
                y: p.random(p.height),
                vx: p.random(-1.2, 1.2),
                vy: p.random(-1.2, 1.2),
                col: colors[Math.floor(p.random(colors.length))],
            })
        }
    }

    p.draw = () => {
        p.background(13, 13, 13, 30)
        p.noStroke()
        for (const pt of particles) {
            p.fill(pt.col)
            p.circle(pt.x, pt.y, 7)
            pt.x += pt.vx
            pt.y += pt.vy
            if (pt.x < 0 || pt.x > p.width) pt.vx *= -1
            if (pt.y < 0 || pt.y > p.height) pt.vy *= -1
        }
    }
}

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
                                background: e.label === selectedEvent ? 'var(--color-event-active-bg)' : 'var(--color-background-secondary)',
                                color: e.label === selectedEvent ? 'var(--color-event-active-text)' : 'var(--color-text-tertiary)',
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
                <div style={{ gridColumn: '1 / -1', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', overflow: 'hidden' }}>
                    <SketchView sketch={testSketch} />
                </div>
            </div>
        </main>
    )
}
