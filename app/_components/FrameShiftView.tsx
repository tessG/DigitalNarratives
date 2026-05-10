import type { TemporalItem } from '../types'
import { cell, cellHeader } from './cellStyles'

function formatDate(date: string) {
    const [, month, day] = date.split('-')
    return `${day}/${month}`
}

export function FrameShiftView({ data }: { data: TemporalItem[] }) {
    const dates = [...new Set(data.map(i => i.date))].sort()
    const maxTemporalCount = Math.max(...data.map(i => i.count), 1)
    return (
        <div style={{ ...cell, padding: '1rem 1.25rem' }}>
            <div style={cellHeader}>Frame shift over time</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', paddingTop: '1rem' }}>
                {dates.map(date => {
                    const individual = data.find(i => i.date === date && i.tag === 'Individual Cause')?.count ?? 0
                    const systemic = data.find(i => i.date === date && i.tag === 'Systemic Cause')?.count ?? 0
                    return (
                        <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%', gap: '2px' }}>
                                {individual > 0 && <div style={{ height: `${(individual / maxTemporalCount) * 80}px`, background: 'var(--color-bar-primary)', borderRadius: '2px' }}></div>}
                                {systemic > 0 && <div style={{ height: `${(systemic / maxTemporalCount) * 80}px`, background: 'var(--color-bar-secondary)', borderRadius: '2px' }}></div>}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>{formatDate(date)}</div>
                        </div>
                    )
                })}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-bar-primary)' }}></div><span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Individual cause</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-bar-secondary)' }}></div><span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Systemic cause</span></div>
            </div>
        </div>
    )
}
