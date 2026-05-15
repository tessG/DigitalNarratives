'use client'

import { useEffect, useState, useMemo } from 'react'
import { SketchView } from './SketchView'
import type { Sketch } from './SketchView'
import type p5 from 'p5'

type GraphNode = {
    uri:    string
    label:  string
    parent: string | null
    count:  number
}

type GraphEdge = {
    source: string
    target: string
    weight: number
    type:   'hierarchy' | 'cooccurrence'
}

type GraphData = {
    nodes: GraphNode[]
    edges: GraphEdge[]
}

const CLASS_COLORS: Record<string, string> = {
    'http://narratives.poc/ontology#NarrativeRole':     '#FF88FA',
    'http://narratives.poc/ontology#FramingFunction':   '#33E08E',
    'http://narratives.poc/ontology#AffectiveRegister': '#FFEC4B',
    'http://narratives.poc/ontology#CausalStructure':   '#FD5061',
}

type PhysicsNode = GraphNode & {
    x: number; y: number
    vx: number; vy: number
    r: number
    color: string
}

function narrativeGraphSketch(data: GraphData): Sketch {
    return (p: p5) => {
        let nodes: PhysicsNode[] = []
        let nodeMap = new Map<string, PhysicsNode>()
        let maxCount = 1

        p.setup = () => {
            p.createCanvas(p.windowWidth - 48, 520)

            const cx = p.width / 2
            const cy = p.height / 2
            const abstracts = data.nodes.filter(n => n.parent === null)
            const theories  = data.nodes.filter(n => n.parent !== null)
            const map       = new Map<string, PhysicsNode>()

            abstracts.forEach((n, i) => {
                const angle = (i / abstracts.length) * Math.PI * 2 - Math.PI / 2
                map.set(n.uri, {
                    ...n,
                    x: cx + Math.cos(angle) * 50,
                    y: cy + Math.sin(angle) * 50,
                    vx: 0, vy: 0,
                    r: 38,
                    color: CLASS_COLORS[n.uri] ?? '#888',
                })
            })

            maxCount = Math.max(1, ...theories.map(n => n.count))
            theories.forEach((n, i) => {
                const angle = (i / theories.length) * Math.PI * 2 - Math.PI / 2
                const ring  = p.lerp(80, 240, 1 - n.count / maxCount)
                map.set(n.uri, {
                    ...n,
                    x: cx + Math.cos(angle) * ring,
                    y: cy + Math.sin(angle) * ring,
                    vx: 0, vy: 0,
                    r: Math.max(6, 3 + n.count * 2.5),
                    color: CLASS_COLORS[n.parent ?? ''] ?? '#888',
                })
            })

            nodes   = [...map.values()]
            nodeMap = map
        }

        p.windowResized = () => p.resizeCanvas(p.windowWidth - 48, 520)

        p.draw = () => {
            p.background(13)

            const cx = p.width / 2
            const cy = p.height / 2

            // Repulsion between all pairs
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i], b = nodes[j]
                    const dx = a.x - b.x, dy = a.y - b.y
                    const d  = Math.max(Math.hypot(dx, dy), 1)
                    const f  = 8000 / (d * d)
                    const nx = dx / d, ny = dy / d
                    a.vx += nx * f; a.vy += ny * f
                    b.vx -= nx * f; b.vy -= ny * f
                }
            }

            // Spring forces along edges
            for (const edge of data.edges) {
                const a = nodeMap.get(edge.source)
                const b = nodeMap.get(edge.target)
                if (!a || !b) continue
                const dx   = b.x - a.x, dy = b.y - a.y
                const d    = Math.max(Math.hypot(dx, dy), 1)
                const rest = edge.type === 'hierarchy' ? 220 : 200
                const k    = edge.type === 'hierarchy'
                    ? 0.05
                    : 0.012 * Math.min(edge.weight, 8)
                const f    = (d - rest) * k
                const nx   = dx / d, ny = dy / d
                a.vx += nx * f; a.vy += ny * f
                b.vx -= nx * f; b.vy -= ny * f
            }

            // Abstract nodes to center; heavy theory nodes pulled in, light ones pushed out
            for (const n of nodes) {
                const g = n.parent === null
                    ? 0.015
                    : p.map(n.count, 0, maxCount, -0.002, 0.006)
                n.vx += (cx - n.x) * g
                n.vy += (cy - n.y) * g
            }

            // Damping and position update
            for (const n of nodes) {
                n.vx *= 0.86; n.vy *= 0.86
                n.x = p.constrain(n.x + n.vx, n.r + 4, p.width  - n.r - 4)
                n.y = p.constrain(n.y + n.vy, n.r + 4, p.height - n.r - 24)
            }

            // Hierarchy edges
            p.strokeWeight(0.5)
            for (const edge of data.edges) {
                if (edge.type !== 'hierarchy') continue
                const a = nodeMap.get(edge.source)
                const b = nodeMap.get(edge.target)
                if (!a || !b) continue
                p.stroke(255, 255, 255, 35)
                p.line(a.x, a.y, b.x, b.y)
            }

            // Co-occurrence edges
            for (const edge of data.edges) {
                if (edge.type !== 'cooccurrence') continue
                const a = nodeMap.get(edge.source)
                const b = nodeMap.get(edge.target)
                if (!a || !b) continue
                p.stroke(255, 255, 255, p.map(edge.weight, 1, 10, 30, 150, true))
                p.strokeWeight(p.map(edge.weight, 1, 10, 0.5, 2.5, true))
                p.line(a.x, a.y, b.x, b.y)
            }

            // Nodes
            for (const n of nodes) {
                if (n.parent === null) {
                    p.noFill()
                    p.drawingContext.setLineDash([4, 4])
                    p.stroke(n.color)
                    p.strokeWeight(1.5)
                    p.circle(n.x, n.y, n.r * 2)
                    p.drawingContext.setLineDash([])
                } else {
                    p.noStroke()
                    p.fill(n.color)
                    p.circle(n.x, n.y, n.r * 2)
                }
            }

            // Labels
            const drawLines = (lines: string[], x: number, y: number) => {
                const lh = 11
                if (lines.length === 1) { p.text(lines[0], x, y); return }
                p.text(lines[0], x, y - lh / 2)
                p.text(lines[1], x, y + lh / 2)
            }
            const splitLabel = (label: string, available: number): string[] => {
                const words = label.split(' ')
                if (words.length === 1 || p.textWidth(label) <= available) return [label]
                const mid = Math.ceil(words.length / 2)
                return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
            }

            for (const n of nodes) {
                const available = n.r * 2 - 10
                if (n.parent === null) {
                    p.fill(n.color)
                    p.textSize(10)
                    p.textAlign(p.CENTER, p.CENTER)
                    drawLines(splitLabel(n.label, available), n.x, n.y)
                } else if (n.r >= 20) {
                    p.fill(0)
                    p.textSize(9)
                    p.textAlign(p.CENTER, p.CENTER)
                    drawLines(splitLabel(n.label, available), n.x, n.y)
                } else {
                    p.fill(255, 255, 255, 210)
                    p.textSize(9)
                    p.textAlign(p.CENTER, p.TOP)
                    const lines = splitLabel(n.label, available)
                    lines.forEach((line, i) => p.text(line, n.x, n.y + n.r + 4 + i * 11))
                }
            }
        }
    }
}

export function NarrativeGraphView({ eventUri }: { eventUri?: string }) {
    const [graphData, setGraphData] = useState<GraphData | null>(null)

    useEffect(() => {
        setGraphData(null)
        const q = eventUri ? `?event=${encodeURIComponent(eventUri)}` : ''
        fetch(`/api/narrative-graph${q}`)
            .then(r => r.json())
            .then(data => { if (Array.isArray(data?.nodes)) setGraphData(data) })
    }, [eventUri])

    const sketch = useMemo(
        () => graphData ? narrativeGraphSketch(graphData) : null,
        [graphData],
    )

    if (!sketch) return (
        <div style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
            Loading…
        </div>
    )

    return <SketchView sketch={sketch} />
}
