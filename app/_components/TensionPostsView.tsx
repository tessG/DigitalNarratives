import type { TensionPost } from '../types'
import { cell, cellHeader } from './cellStyles'

function formatFullDate(date: string) {
    const [year, month, day] = date.split('-')
    return `${day}/${month}/${year}`
}

export function TensionPostsView({ data }: { data: TensionPost[] }) {
    return (
        <div style={{ ...cell, padding: '1rem 1.25rem' }}>
            <div style={cellHeader}>Tension posts</div>
            {data.map((post, i) => (
                <div key={i} style={{ border: '0.5px solid var(--color-border-tertiary)', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>{post.platform} · {formatFullDate(post.date)}</div>
                    <div style={{ fontSize: '13px', lineHeight: 1.5 }}>{post.content.slice(0, 120)}...</div>
                    <div style={{ marginTop: '6px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '8px', background: 'var(--color-badge-bg)', color: 'var(--color-badge-text)' }}>contradictory</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
