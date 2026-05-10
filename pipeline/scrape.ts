import * as fs from 'fs'
import * as path from 'path'
import { EVENTS, EVENT_BY_LABEL } from '../lib/events'
import type { Post } from './types'

loadEnv()

const EVENT_ARG = process.argv[2]
const LIMIT     = parseInt(process.argv[3] || '200')

const USER_AGENT = process.env.REDDIT_USER_AGENT || 'digitalnarratives-poc/0.1'

type RedditChild = {
    data: {
        id: string
        title: string
        selftext: string
        author: string
        created_utc: number
        subreddit: string
        url: string
        score: number
    }
}

async function getToken(): Promise<string> {
    const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET } = process.env
    if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
        throw new Error('Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env.local')
    }
    const credentials = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64')
    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
            Authorization:  `Basic ${credentials}`,
            'User-Agent':   USER_AGENT,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    })
    if (!res.ok) throw new Error(`Reddit auth failed: ${res.status} ${await res.text()}`)
    const data = await res.json() as { access_token: string }
    return data.access_token
}

async function fetchBatch(token: string, subreddit: string, after: string | null): Promise<{ children: RedditChild[]; after: string | null }> {
    const params = new URLSearchParams({ limit: '100', t: 'year' })
    if (after) params.set('after', after)
    const res = await fetch(`https://oauth.reddit.com/r/${subreddit}/top?${params}`, {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': USER_AGENT },
    })
    if (!res.ok) throw new Error(`Reddit fetch failed: ${res.status} ${await res.text()}`)
    const data = await res.json() as { data: { children: RedditChild[]; after: string | null } }
    return data.data
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

    console.log(`Scraping r/${eventDef.subreddit} for "${eventDef.label}", up to ${LIMIT} posts…`)
    const token = await getToken()

    const posts: Post[] = []
    let after: string | null = null

    while (posts.length < LIMIT) {
        const batch = await fetchBatch(token, eventDef.subreddit, after)
        for (const { data: p } of batch.children) {
            const content = [p.title, p.selftext].filter(s => s?.trim()).join('\n\n').trim()
            if (!content) continue
            posts.push({
                id:        `reddit_${p.id}`,
                platform:  'reddit',
                subreddit: p.subreddit,
                content,
                date:      new Date(p.created_utc * 1000).toISOString().split('T')[0],
                url:       p.url,
                score:     p.score,
                eventUri:  eventDef.uri,
                language:  eventDef.language,
                region:    eventDef.region,
            })
            if (posts.length >= LIMIT) break
        }
        after = batch.after
        if (!after || batch.children.length === 0) break
        await new Promise(r => setTimeout(r, 1000))
        process.stdout.write(`\r  ${posts.length} posts fetched…`)
    }

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
