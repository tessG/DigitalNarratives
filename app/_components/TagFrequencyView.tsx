import type { TagFrequencyItem } from '../types'
import { cell, cellHeader } from './cellStyles'

export function TagFrequencyView({ data }: { data: TagFrequencyItem[] }) {
    const maxCount = Math.max(...data.map(i => i.count), 1)
    return (
        <div style={{ ...cell, padding: '1rem 1.25rem' }}>
            <div style={cellHeader}>Tag frequency</div>
            {data.map(item => (
                <div key={item.tag} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                    <span style={{ fontSize: '14px' }}>{item.tag}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ height: '6px', width: `${(item.count / maxCount) * 80}px`, background: 'var(--color-bar-secondary)', borderRadius: '3px' }}></div>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', minWidth: '16px', textAlign: 'right' }}>{item.count}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
