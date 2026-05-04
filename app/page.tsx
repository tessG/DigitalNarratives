'use client'

import { useEffect, useState } from 'react'

type TagFrequencyItem = {
  tag: string
  count: number
}
export default function Home() {
  const [tagFrequency, setTagFrequency] = useState<TagFrequencyItem[]>([])

  useEffect(() => {
    fetch('/api/tag-frequency')
        .then(res => res.json())
        .then(data => setTagFrequency(data))
  }, [])



  return (
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Narrative Fingerprint</h1>
        <div className="flex gap-8">
          <ul className="w-64 shrink-0">
            {tagFrequency.map(item => (
                <li
                    key={item.tag} className="flex justify-between py-2 border-b">
                  <span>{item.tag}</span>
                  <span className="font-mono text-gray-500">{item.count}</span>
                </li>
              ))}
          </ul>
          </div>
      </main>
)
}