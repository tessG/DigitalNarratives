import type { CooccurrenceItem } from '../types'
import { cell, cellHeader } from './cellStyles'

export function CooccurrenceView({ data }: { data: CooccurrenceItem[] }) {
    return (
        <div style={{ ...cell, padding: '1rem 1.25rem' }}>
            <div style={cellHeader}>Co-occurrence</div>
            {data.slice(0, 6).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: 'var(--color-tag-a-bg)', color: 'var(--color-tag-text)' }}>{item.tagA}</span>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: 'var(--color-tag-b-bg)', color: 'var(--color-tag-text)' }}>{item.tagB}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>{item.count}×</span>
                </div>
            ))}
        </div>
    )
}
