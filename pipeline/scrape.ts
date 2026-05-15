import * as fs from 'fs'
import * as path from 'path'
import { EVENTS, EVENT_BY_LABEL } from '../lib/events'
import type { Post } from './types'

loadEnv()

const EVENT_ARG = process.argv[2]
const LIMIT     = parseInt(process.argv[3] || '200')

const ARCTIC_SHIFT_URL = 'https://arctic-shift.photon-reddit.com/api/posts/search'

type ArcticPost = {
    id:          string
    title:       string
    selftext:    string
    author:      string
    created_utc: number
    subreddit:   string
    url:         string
    score:       number
}

async function fetchBatch(subreddit: string, after: number, before: number): Promise<ArcticPost[]> {
    const params = new URLSearchParams({
        subreddit,
        limit:  '100',
        after:  String(after),
        before: String(before),
        sort:   'asc',
    })
    const res = await fetch(`${ARCTIC_SHIFT_URL}?${params}`)
    if (!res.ok) throw new Error(`Arctic Shift fetch failed: ${res.status} ${await res.text()}`)
    const data = await res.json() as { data: ArcticPost[] }
    return data.data ?? []
}

async function main() {
    if (!EVENT_ARG) {
        console.error('Usage: pipeline:scrape "<event label>" [limit]')
        console.error('Available events:')
        EVENTS.forEach(e => console.error(`  "${e.label}"  →  r/${e.subreddit}`))
        process.exit(1)
    }

    const eventDef = EVENT_BY_LABEL[EVENT_ARG]
    if (!eventDef) {
        console.error(`Unknown event "${EVENT_ARG}". Available events:`)
        EVENTS.forEach(e => console.error(`  "${e.label}"`))
        process.exit(1)
    }

    const outDir = path.join(process.cwd(), 'pipeline', 'data')
    fs.mkdirSync(outDir, { recursive: true })

    const afterTs  = Math.floor(new Date(eventDef.dateFrom).getTime() / 1000)
    const beforeTs = Math.floor(new Date(eventDef.dateTo).getTime() / 1000)

    console.log(`Scraping r/${eventDef.subreddit} for "${eventDef.label}" (${eventDef.dateFrom} → ${eventDef.dateTo}), up to ${LIMIT} posts…`)

    const allPosts: ArcticPost[] = []
    let cursor = afterTs

    while (allPosts.length < LIMIT * 3) {
        const batch = await fetchBatch(eventDef.subreddit, cursor, beforeTs)
        if (batch.length === 0) break
        allPosts.push(...batch)
        cursor = batch[batch.length - 1].created_utc + 1
        if (cursor >= beforeTs) break
        process.stdout.write(`\r  ${allPosts.length} posts collected…`)
        await new Promise(r => setTimeout(r, 500))
    }

    // sort by score descending, take top LIMIT
    allPosts.sort((a, b) => b.score - a.score)
    const top = allPosts.slice(0, LIMIT)

    const posts: Post[] = top
        .map(p => {
            const content = [p.title, p.selftext].filter(s => s?.trim()).join('\n\n').trim()
            if (!content) return null
            return {
                id:        `reddit_${p.id}`,
                platform:  'reddit' as const,
                subreddit: p.subreddit,
                content,
                date:      new Date(p.created_utc * 1000).toISOString().split('T')[0],
                url:       p.url,
                score:     p.score,
                eventUri:  eventDef.uri,
                language:  eventDef.language,
                region:    eventDef.region,
            }
        })
        .filter((p): p is Post => p !== null)

    const outPath = path.join(outDir, 'posts.json')
    fs.writeFileSync(outPath, JSON.stringify(posts, null, 2))
    console.log(`\nWrote ${posts.length} posts → ${outPath}`)
}

function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) return
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        const key = trimmed.slice(0, eq).trim()
        const val = trimmed.slice(eq + 1).trim()
        if (key && !(key in process.env)) process.env[key] = val
    }
}

main().catch(err => { console.error(err.message); process.exit(1) })
