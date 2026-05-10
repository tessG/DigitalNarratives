'use client'

import { useEffect, useRef } from 'react'
import type p5 from 'p5'

export type Sketch = (p: p5) => void

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
