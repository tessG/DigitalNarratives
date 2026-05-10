'use client'

import { useEffect, useRef } from 'react'
import type p5 from 'p5'

export type Sketch = (p: p5) => void

const colors = ['#FF88FA', '#33E08E', '#FD5061', '#FFEC4B']

export const testSketch: Sketch = (p) => {
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

export function SketchView({ sketch }: { sketch: Sketch }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const sketchRef = useRef<Sketch>(sketch)
    sketchRef.current = sketch

    useEffect(() => {
        if (!containerRef.current) return
        let instance: p5
        import('p5').then(({ default: P5 }) => {
            if (!containerRef.current) return
            instance = new P5(sketchRef.current, containerRef.current)
        })
        return () => { instance?.remove() }
    }, [])

    return <div ref={containerRef} />
}
