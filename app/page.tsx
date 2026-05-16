'use client'

import { useEffect, useRef, useState } from 'react'
import type { TagFrequencyItem, CooccurrenceItem, TemporalItem, TensionPost } from './types'
import { TagFrequencyView } from './_components/TagFrequencyView'
import { FrameShiftView } from './_components/FrameShiftView'
import { CooccurrenceView } from './_components/CooccurrenceView'
import { TensionPostsView } from './_components/TensionPostsView'
import { NarrativeGraphView } from './_components/NarrativeGraphView'
import { EVENTS, EVENT_BY_LABEL } from '../lib/events'

type Cache = {
    tagFrequency: TagFrequencyItem[]
    cooccurrence: CooccurrenceItem[]
    temporalArc:  TemporalItem[]
    tensionPosts: TensionPost[]
}

export default function Home() {
    const [tagFrequency, setTagFrequency] = useState<TagFrequencyItem[]>([])
    const [cooccurrence, setCooccurrence] = useState<CooccurrenceItem[]>([])
    const [temporalArc, setTemporalArc]   = useState<TemporalItem[]>([])
    const [tensionPosts, setTensionPosts] = useState<TensionPost[]>([])
    const [selectedEvent, setSelectedEvent] = useState('BLM Denmark 2020')
    const cache = useRef<Map<string, Cache>>(new Map())

    useEffect(() => {
        const eventUri = EVENT_BY_LABEL[selectedEvent]?.uri ?? ''
        const q = eventUri ? `?event=${encodeURIComponent(eventUri)}` : ''

        if (cache.current.has(eventUri)) {
            const hit = cache.current.get(eventUri)!
            setTagFrequency(hit.tagFrequency)
            setCooccurrence(hit.cooccurrence)
            setTemporalArc(hit.temporalArc)
            setTensionPosts(hit.tensionPosts)
            return
        }

        Promise.all([
            fetch(`/api/tag-frequency${q}`).then(r => r.json()),
            fetch(`/api/cooccurrence${q}`).then(r => r.json()),
            fetch(`/api/temporal-arc${q}`).then(r => r.json()),
            fetch(`/api/tension-posts${q}`).then(r => r.json()),
        ]).then(([tf, co, ta, tp]) => {
            cache.current.set(eventUri, { tagFrequency: tf, cooccurrence: co, temporalArc: ta, tensionPosts: tp })
            setTagFrequency(tf)
            setCooccurrence(co)
            setTemporalArc(ta)
            setTensionPosts(tp)
        })
    }, [selectedEvent])

    return (
        <main style={{ padding: '1.5rem', background: 'var(--color-background-tertiary)', minHeight: '100vh' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <span style={{ fontSize: '18px', fontWeight: 500 }}>Narrative fingerprint</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Event</span>
                    {EVENTS.map(e => (
                        <span
                            key={e.label}
                            onClick={() => setSelectedEvent(e.label)}
                            style={{
                                fontSize: '13px',
                                fontWeight: e.label === selectedEvent ? 500 : 400,
                                padding: '4px 12px',
                                borderRadius: '20px',
                                cursor: 'pointer',
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
                <div style={{ gridColumn: '1 / -1', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '12px', overflow: 'hidden' }}>
                    <NarrativeGraphView eventUri={EVENT_BY_LABEL[selectedEvent]?.uri} />
                </div>
                <TagFrequencyView data={tagFrequency} />
                <FrameShiftView data={temporalArc} />
                <CooccurrenceView data={cooccurrence} />
                <TensionPostsView data={tensionPosts} />
            </div>
        </main>
    )
}
