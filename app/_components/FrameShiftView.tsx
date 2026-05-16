import type { TemporalItem } from '../types'
import { cell, cellHeader } from './cellStyles'

function formatDate(date: string) {
    const [, month, day] = date.split('-')
    return `${day}/${month}`
}

const W = 500
const H = 120
const PAD = { top: 10, right: 10, bottom: 22, left: 28 }
const plotW = W - PAD.left - PAD.right
const plotH = H - PAD.top - PAD.bottom

export function FrameShiftView({ data }: { data: TemporalItem[] }) {
    const dates    = [...new Set(data.map(i => i.date))].sort()
    const maxCount = Math.max(...data.map(i => i.count), 1)

    const x = (i: number) => PAD.left + (dates.length < 2 ? plotW / 2 : (i / (dates.length - 1)) * plotW)
    const y = (count: number) => PAD.top + plotH - (count / maxCount) * plotH

    const polyline = (tag: string) =>
        dates.map((date, i) => {
            const count = data.find(d => d.date === date && d.tag === tag)?.count ?? 0
            return `${x(i)},${y(count)}`
        }).join(' ')

    const dots = (tag: string, color: string) =>
        dates.map((date, i) => {
            const count = data.find(d => d.date === date && d.tag === tag)?.count ?? 0
            return <circle key={date} cx={x(i)} cy={y(count)} r={2.5} fill={color} />
        })

    return (
        <div style={{ ...cell, padding: '1rem 1.25rem' }}>
            <div style={cellHeader}>Frame shift over time</div>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: '100%', height: 'auto', marginTop: '0.5rem' }}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Y gridlines */}
                {[0, 0.5, 1].map(t => (
                    <line
                        key={t}
                        x1={PAD.left} y1={PAD.top + plotH * (1 - t)}
                        x2={W - PAD.right} y2={PAD.top + plotH * (1 - t)}
                        stroke="rgba(255,255,255,0.06)" strokeWidth={1}
                    />
                ))}

                {/* Lines */}
                <polyline
                    points={polyline('Individual Cause')}
                    fill="none"
                    stroke="var(--color-bar-primary)"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                />
                <polyline
                    points={polyline('Systemic Cause')}
                    fill="none"
                    stroke="var(--color-bar-secondary)"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                />

                {/* Dots */}
                {dots('Individual Cause', 'var(--color-bar-primary)')}
                {dots('Systemic Cause', 'var(--color-bar-secondary)')}

                {/* X axis labels */}
                {dates.map((date, i) => (
                    <text
                        key={date}
                        x={x(i)} y={H - 4}
                        textAnchor="middle"
                        fontSize={8}
                        fill="rgba(255,255,255,0.35)"
                    >
                        {formatDate(date)}
                    </text>
                ))}
            </svg>

            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '2px', background: 'var(--color-bar-primary)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Individual cause</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '10px', height: '2px', background: 'var(--color-bar-secondary)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Systemic cause</span>
                </div>
            </div>
        </div>
    )
}
