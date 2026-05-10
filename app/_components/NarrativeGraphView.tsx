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

        p.setup = () => {
            p.createCanvas(p.windowWidth - 48, 480)

            const cx = p.width / 2
            const cy = p.height / 2
            const abstracts = data.nodes.filter(n => n.parent === null)
            const theories  = data.nodes.filter(n => n.parent !== null)
            const map       = new Map<string, PhysicsNode>()

            abstracts.forEach((n, i) => {
                const angle = (i / abstracts.length) * Math.PI * 2 - Math.PI / 2
                const ring  = Math.min(p.width, p.height) * 0.28
                map.set(n.uri, {
                    ...n,
                    x: cx + Math.cos(angle) * ring,
                    y: cy + Math.sin(angle) * ring,
                    vx: 0, vy: 0,
                    r: 38,
                    color: CLASS_COLORS[n.uri] ?? '#888',
                })
            })

            theories.forEach(n => {
                const parent = map.get(n.parent!)
                const angle  = p.random(Math.PI * 2)
                const dist   = 70 + p.random(40)
                map.set(n.uri, {
                    ...n,
                    x: (parent?.x ?? cx) + Math.cos(angle) * dist,
                    y: (parent?.y ?? cy) + Math.sin(angle) * dist,
                    vx: 0, vy: 0,
                    r: Math.max(10, 8 + Math.sqrt(n.count) * 3),
                    color: CLASS_COLORS[n.parent ?? ''] ?? '#888',
                })
            })

            nodes   = [...map.values()]
            nodeMap = map
        }

        p.windowResized = () => p.resizeCanvas(p.windowWidth - 48, 480)

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
                const rest = edge.type === 'hierarchy' ? 140 : 200
                const k    = edge.type === 'hierarchy'
                    ? 0.05
                    : 0.012 * Math.min(edge.weight, 8)
                const f    = (d - rest) * k
                const nx   = dx / d, ny = dy / d
                a.vx += nx * f; a.vy += ny * f
                b.vx -= nx * f; b.vy -= ny * f
            }

            // Centering gravity
            for (const n of nodes) {
                n.vx += (cx - n.x) * 0.002
                n.vy += (cy - n.y) * 0.002
            }

            // Damping and position update
            for (const n of nodes) {
                n.vx *= 0.86; n.vy *= 0.86
                n.x = p.constrain(n.x + n.vx, n.r + 4, p.width  - n.r - 4)
                n.y = p.constrain(n.y + n.vy, n.r + 4, p.height - n.r - 4)
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
            p.noStroke()
            for (const n of nodes) {
                p.fill(n.color)
                p.circle(n.x, n.y, n.r * 2)
            }

            // Labels
            for (const n of nodes) {
                if (n.parent === null) {
                    p.fill(0)
                    p.textSize(10)
                    p.textAlign(p.CENTER, p.CENTER)
                    p.text(n.label, n.x, n.y)
                } else {
                    p.fill(255, 255, 255, 210)
                    p.textSize(9)
                    p.textAlign(p.CENTER, p.TOP)
                    p.text(n.label, n.x, n.y + n.r + 4)
                }
            }
        }
    }
}

export function NarrativeGraphView() {
    const [graphData, setGraphData] = useState<GraphData | null>(null)

    useEffect(() => {
        fetch('/api/narrative-graph').then(r => r.json()).then(setGraphData)
    }, [])

    const sketch = useMemo(
        () => graphData ? narrativeGraphSketch(graphData) : null,
        [graphData],
    )

    if (!sketch) return (
        <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
            Loading…
        </div>
    )

    return <SketchView sketch={sketch} />
}
